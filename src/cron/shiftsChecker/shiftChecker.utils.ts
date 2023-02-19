
import { ShiftTimeframe } from '@/commands/shift'
import { getSourceLink } from '@/helpers/getSourceLInk'

import { calcGrowPercent, getCandleCreatedTime } from '../../helpers'
import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log'
import {
  getInstrumentByIdFromCache,
  ShiftCandle,
  TimeShift,
  TimeShiftModel
} from '../../models'
import { shiftAlertSettingsKeyboard } from './shiftChecker.keyboards'

const logPrefix = '[SHIFT CHECKER]'

interface GetUpdatedCandleParams {
  shift: TimeShift
  candle: ShiftCandle
  price: number
  timeframeData: ShiftTimeframe
}

/**
 * Вернет обновленную свечу
 */
export const updateCandle = ({
  shift,
  candle,
  price,
  timeframeData
}: GetUpdatedCandleParams): ShiftCandle => {
  let updatedCandle = candle

  // Время создания последней актуальной свечи
  const actualCandleCreatedTime = getCandleCreatedTime(timeframeData)
  // Время создания последней сохраненной свечи
  const localCandleCreatedTime = candle?.createdAt

  /**
     * Если случилось расхождение actualCandleCreatedTime и localCandleCreatedTime
     * Это значит, что появилась новая свеча и текущая деактуализировалась
     * Либо свечи не существовало ранее
     */
  if (actualCandleCreatedTime !== localCandleCreatedTime) { // создать новую свечу
    updatedCandle = {
      tickerId: shift.tickerId,
      timeframe: shift.timeframe,
      o: price,
      h: price,
      l: price,
      createdAt: actualCandleCreatedTime,
      updatedAt: new Date().getTime()
    }
  } else {
    if (price > candle.h) { // Побили самую высокую цену
      log.info(logPrefix, 'Updated candle h', shift.tickerId, price)

      // апдейт верха старой и запись
      updatedCandle = {
        ...candle,
        h: price,
        updatedAt: new Date().getTime()
      }
    }

    if (price < candle.l) { // Побили самую низкую цену
      log.info(logPrefix, 'Updated candle l', shift.tickerId, price)

      // апдейт низа старой и запись
      updatedCandle = {
        ...candle,
        l: price,
        updatedAt: new Date().getTime()
      }
    }
  }

  return updatedCandle
}

/**
 * Cache for shifts for save sent alerts time
 */
const triggeredShiftsCache = new Map<string, {lastMessageCandleGrowTime: number}>()

/**
 * Проверит стриггерился ли алерт и отправит сообщение юзеру если да
 */
export const checkTriggeredShiftsAndSendMessage = async ({
  candle,
  bot,
  shift,
  timeframeData
}) => {
  const growPercent = calcGrowPercent(candle.h, candle.o)
  const fallPercent = calcGrowPercent(candle.l, candle.o)

  const { ticker, muted, _id } = shift

  // Если случился движение вниз на указанный процент
  if (fallPercent >= shift.percent && shift.fallAlerts) {
    await sendMessage(false)
  }

  // Если движение вверх на указанный процент
  if (growPercent >= shift.percent && shift.growAlerts) {
    await sendMessage(true)
  }

  async function sendMessage (isGrow) {
    const tickerInfo = await getInstrumentByIdFromCache(shift.tickerId)

    const actualCandleCreatedTime = getCandleCreatedTime(timeframeData)

    const shiftCache = triggeredShiftsCache.get(shift._id)
    // If we have something in cache it means that and data more fresh than in DB
    const lastMessageCandleGrowTime = shiftCache?.lastMessageCandleGrowTime ?? shift.lastMessageCandleGrowTime

    const growMessageAlreadyWasSent = lastMessageCandleGrowTime === actualCandleCreatedTime
    const fallMessageAlreadyWasSent = lastMessageCandleGrowTime === actualCandleCreatedTime

    // Если уже отравили алерт на рост
    if (growMessageAlreadyWasSent && isGrow) {
      return
    }

    // Если уже отправили алерт на падение
    if (fallMessageAlreadyWasSent && !isGrow) {
      return
    }

    const sourceLink = getSourceLink(tickerInfo)

    // !!! Update cache before send message for make it faster and not create message duplicate
    triggeredShiftsCache.set(shift._id, { lastMessageCandleGrowTime: actualCandleCreatedTime })
    // !!! No 'await' for not block iterator
    bot.telegram.sendMessage(shift.user, i18n.t(
      'ru', 'shift_alert',
      {
        name: tickerInfo.name,
        percent: shift.percent,
        isGrow,
        time: timeframeData.name_ru_plur,
        ticker,
        source: sourceLink
      }
    ), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      disable_notification: muted,
      reply_markup: {
        inline_keyboard: shiftAlertSettingsKeyboard({ id: _id, isGrow })
      }
    })
      .then(async () => {
        // Update last message candle time
        const dataToUpdate = isGrow
          ? ({ lastMessageCandleGrowTime: actualCandleCreatedTime })
          : ({ lastMessageCandleFallTime: actualCandleCreatedTime })

        // Апдейт признака о том, что сообщение отправлено
        await TimeShiftModel.updateOne({ _id: shift._id }, {
          $set: dataToUpdate
        })
      })
      .catch(async (e) => {
        log.error(logPrefix, e)

        // If bot was blocked by user
        // TODO: Create middleware for this
        if (e.code === 403 && e.description === 'Forbidden: bot was blocked by the user') {
          await TimeShiftModel.remove({ _id: shift._id })

          log.info(logPrefix, 'Deleted shift because bot blocked by user')
        }
      })
  }
}
