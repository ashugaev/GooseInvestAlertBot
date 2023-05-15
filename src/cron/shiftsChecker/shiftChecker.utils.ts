
import { ShiftTimeframe } from '@/commands/shift'
import { shiftsCache } from '@/cron/shiftsChecker/shiftsChecker'
import { getBot} from "@/helpers/bot"
import {getSourceMark} from "@/helpers/getSourceMark"
import {ChatModel} from "@/models/Chat"

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
      // апдейт верха старой и запись
      updatedCandle = {
        ...candle,
        h: price,
        updatedAt: new Date().getTime()
      }
    }

    if (price < candle.l) { // Побили самую низкую цену
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
const triggeredShiftsCache: Record<string, {lastMessageCandleGrowTime: number}> = {}

/**
 * Проверит стриггерился ли алерт и отправит сообщение юзеру если да
 */
export const checkTriggeredShiftsAndSendMessage = async ({
  candle,
  shift,
  timeframeData
}) => {
  const growPercent = calcGrowPercent(candle.h, candle.o)
  const fallPercent = calcGrowPercent(candle.l, candle.o)

  const { ticker, muted, _id } = shift

  // Если случился движение вниз на указанный процент
  if (Math.abs(fallPercent) >= shift.percent && shift.fallAlerts) {
    await sendMessage(false)
  }

  // Если движение вверх на указанный процент
  if (growPercent >= shift.percent && shift.growAlerts) {
    await sendMessage(true)
  }

  async function sendMessage (isGrow) {
    const tickerInfo = await getInstrumentByIdFromCache(shift.tickerId)

    const actualCandleCreatedTime = getCandleCreatedTime(timeframeData)

    const shiftCache = triggeredShiftsCache[shift._id]
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

    const sourceLink = getSourceMark(tickerInfo)

    const keyboard = shiftAlertSettingsKeyboard({ id: _id, isGrow })

    // !!! Update cache before send message for make it faster and not create message duplicate
    // @ts-ignore
    triggeredShiftsCache[shift._id] = { lastMessageCandleGrowTime: actualCandleCreatedTime }
    const bot = await getBot(shift.botId)
    if(!bot) {
      log.error('Bot removed error. Handle this case gracefully!')
      return
    }

    // !!! No 'await' in sentMessage for not block iterator
    bot.telegram.sendMessage(shift.chat ?? shift.user, i18n.t(
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
        inline_keyboard: shift.chat ? [] : keyboard
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
        if (
          (e.code === 403 &&
            (
              e.description === 'Forbidden: bot was blocked by the user' ||
              e.description === 'Forbidden: user is deactivated'
            )) ||
            // Бота кикнули
            (e.code === 400 && e.description === 'Bad Request: chat not found')
        ) {
          await TimeShiftModel.remove({ _id: shift._id })
          shiftsCache.update()

          log.info(logPrefix, 'Deleted shift because bot blocked by user')
        }

        if(
          e.description === 'Bad Request: group chat was upgraded to a supergroup chat' &&
            e.parameters?.migrate_to_chat_id &&
            shift.chat
        ) {
          // Update chat in time shift
          await TimeShiftModel.updateOne({ _id: shift._id }, {$set: {
            chat: e.parameters?.migrate_to_chat_id
          }})
          // Update chat in Chat model
          await ChatModel.updateOne({ id: shift.chat }, {$set: {
            id: e.parameters?.migrate_to_chat_id,
            type: 'supergroup'
          }})
        }
      })
  }
}
