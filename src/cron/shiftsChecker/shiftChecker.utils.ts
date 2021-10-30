import { calcGrowPercent, getCandleCreatedTime } from '../../helpers'
import { ShiftCandle, ShiftCandleModel } from '../../models/ShiftCandle'
import { i18n } from '../../helpers/i18n'
import { getInstrumentInfoByTicker } from '../../models'
import { getInstrumentLink } from '../../helpers/getInstrumentLInk'

/**
 * Обновит свечу в базе и вернет новую свечу
 */
export const updateCandle = async ({
  shift,
  candle: c,
  price,
  timeframeData
}) => {
  let candle = c

  // Время создания последней актуальной свечи
  const actualCandleCreatedTime = getCandleCreatedTime(timeframeData)

  // Время создания последней сохраненной свечи
  const localCandleCreatedTime = candle?.createdAt

  /**
     * Если случилось расхождение actualCandleCreatedTime и localCandleCreatedTime
     * Это значит, что появилась новая свеча и текущая деактуализировалась
     * Либо свечи не существовало ранее
     */
  if (actualCandleCreatedTime !== localCandleCreatedTime) {
    // создать новую свечу и записать

    candle = {
      ticker: shift.ticker,
      timeframe: shift.timeframe,
      o: price,
      h: price,
      l: price,
      createdAt: actualCandleCreatedTime,
      updatedAt: new Date().getTime()
    }

    // FIXME: Вообще это можнро сделать одной командой
    //  Но почему-то upsert не работает в typegoose
    // Грохаем старую свечу (если была)
    await ShiftCandleModel.deleteOne({ timeframe: shift.timeframe, ticker: shift.ticker })
    // Делаем новую свечу
    await ShiftCandleModel.insertMany(candle)
  } else {
    if (price > candle.h) {
      // апдейт верха старой и запись

      candle = {
        ...candle,
        h: price,
        updatedAt: new Date().getTime()
      }
    }

    if (price < candle.l) {
      // апдейт низа старой и запись

      candle = {
        ...candle,
        l: price,
        updatedAt: new Date().getTime()
      }
    }

    // Пишем свечу в базу, если был апдейт объекта
    if (c !== candle) {
      await ShiftCandleModel.update({ _id: candle._id }, { $set: candle })
    }
  }

  return candle
}

/**
 * Отправит юзеру сообщение, если свеча стриггерила его алерт
 */
export const sendUserMessage = async ({
  candle,
  bot,
  shift,
  timeframeData
}) => {
  const growPercent = calcGrowPercent(candle.h, candle.o)
  const fallPercent = calcGrowPercent(candle.l, candle.o)

  const { ticker, muted } = shift

  const sendMessage = async (isGrow) => {
    const tickerInfo = (await getInstrumentInfoByTicker({ ticker }))[0]

    const actualCandleCreatedTime = getCandleCreatedTime(timeframeData)

    const messageAlreadyWasSent = shift.lastMessageCandleTime === actualCandleCreatedTime

    if (messageAlreadyWasSent) {
      return
    }

    await bot.telegram.sendMessage(shift.user, i18n.t(
      'ru', 'shift_alert',
      {
        name: tickerInfo.name,
        percent: shift.percent,
        isGrow,
        time: timeframeData.name_ru_plur,
        ticker,
        link: getInstrumentLink({
          type: tickerInfo.type,
          source: tickerInfo.source,
          ticker
        })
      }
    ), {
      parse_mode: 'HTML',
      disable_notification: muted
    })

    // Апдейт признака о том, что сообщение отправлено
    // TODO: Почему-то не апдейтится
    ShiftCandleModel.update({ _id: candle._id }, {
      $set: {
        lastMessageCandleTime: actualCandleCreatedTime
      }
    })
  }

  // Если случился движение вниз на указанный процент
  if (fallPercent >= shift.percent && shift.fallAlerts) {
    await sendMessage(false)
  }

  // Если движение вверх на указанный процент
  if (growPercent >= shift.percent && shift.growAlerts) {
    await sendMessage(true)
  }
}
