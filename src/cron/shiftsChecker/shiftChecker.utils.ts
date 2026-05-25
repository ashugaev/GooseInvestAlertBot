import { ShiftTimeframe } from '@/commands/shift'
import { shiftsCache } from '@/cron/shiftsChecker/shiftsChecker'
import { getBot } from '@/helpers/bot'
import { getLastPrice } from '@/helpers/getLastPrice'
import { getSourceMark } from '@/helpers/getSourceMark'
import { getSymbolByTicker } from '@/helpers/getSymbolByTicker'
import { isShutdownMode } from '@/helpers/isShutdownMode'
import { ChatModel } from '@/models/Chat'

import { calcGrowPercent, getCandleCreatedTime } from '../../helpers'
import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log'
import {
  getInstrumentByIdFromCache,
  ShiftCandle,
  TimeShift,
  TimeShiftModel,
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
 * Returns an updated candle
 */
export const updateCandle = ({
  shift,
  candle,
  price,
  timeframeData,
}: GetUpdatedCandleParams): ShiftCandle => {
  let updatedCandle = candle

  // Creation time of the latest actual candle
  const actualCandleCreatedTime = getCandleCreatedTime(timeframeData)
  // Creation time of the latest stored candle
  const localCandleCreatedTime = candle?.createdAt

  /**
   * If actualCandleCreatedTime diverges from localCandleCreatedTime
   * it means a new candle has appeared and the current one is stale,
   * or no candle existed before.
   */
  if (actualCandleCreatedTime !== localCandleCreatedTime) {
    // create a new candle
    updatedCandle = {
      tickerId: shift.tickerId,
      timeframe: shift.timeframe,
      o: price,
      h: price,
      l: price,
      createdAt: actualCandleCreatedTime,
      updatedAt: new Date().getTime(),
    }
  } else {
    if (price > candle.h) {
      // New high broken
      // Update the high of the existing candle and persist
      updatedCandle = {
        ...candle,
        h: price,
        updatedAt: new Date().getTime(),
      }
    }

    if (price < candle.l) {
      // New low broken
      // Update the low of the existing candle and persist
      updatedCandle = {
        ...candle,
        l: price,
        updatedAt: new Date().getTime(),
      }
    }
  }

  return updatedCandle
}

/**
 * Cache for shifts for save sent alerts time
 */
const triggeredShiftsCache: Record<
  string,
  { lastMessageCandleGrowTime: number }
> = {}

/**
 * Checks whether the alert triggered, and if so sends a message to the user
 */
export const checkTriggeredShiftsAndSendMessage = async ({
  candle,
  shift,
  timeframeData,
}) => {
  // Kill switch: do not push any shift alerts while SHUTDOWN_MODE is on.
  // Returning before the percent math keeps the triggeredShiftsCache untouched
  // so nothing leaks out when the flag is later removed.
  if (isShutdownMode()) return

  const growPercent = calcGrowPercent(candle.h, candle.o)
  const fallPercent = calcGrowPercent(candle.l, candle.o)

  const { ticker, muted, _id } = shift

  // Downward move by the configured percent
  if (Math.abs(fallPercent) >= shift.percent && shift.fallAlerts) {
    await sendMessage(false)
  }

  // Upward move by the configured percent
  if (growPercent >= shift.percent && shift.growAlerts) {
    await sendMessage(true)
  }

  async function sendMessage(isGrow) {
    const tickerInfo = await getInstrumentByIdFromCache(shift.tickerId)

    const actualCandleCreatedTime = getCandleCreatedTime(timeframeData)

    const shiftCache = triggeredShiftsCache[shift._id]
    // If we have something in cache it means that and data more fresh than in DB
    const lastMessageCandleGrowTime =
      shiftCache?.lastMessageCandleGrowTime ?? shift.lastMessageCandleGrowTime

    const growMessageAlreadyWasSent =
      lastMessageCandleGrowTime === actualCandleCreatedTime
    const fallMessageAlreadyWasSent =
      lastMessageCandleGrowTime === actualCandleCreatedTime

    // Growth alert already sent
    if (growMessageAlreadyWasSent && isGrow) {
      return
    }

    // Fall alert already sent
    if (fallMessageAlreadyWasSent && !isGrow) {
      return
    }

    const sourceLink = getSourceMark(tickerInfo)

    const keyboard = shiftAlertSettingsKeyboard({ id: _id, isGrow })

    // !!! Update cache before send message for make it faster and not create message duplicate
    // @ts-ignore
    triggeredShiftsCache[shift._id] = {
      lastMessageCandleGrowTime: actualCandleCreatedTime,
    }
    const bot = await getBot(shift.botId)
    if (!bot) {
      log.error('Bot removed error. Handle this case gracefully!')
      return
    }

    // !!! No 'await' in sentMessage for not block iterator
    bot.telegram
      .sendMessage(
        shift.chat ?? shift.user,
        i18n.t('ru', 'shift_alert', {
          name: tickerInfo.name,
          percent: shift.percent,
          isGrow,
          time: timeframeData.name_ru_plur,
          ticker: tickerInfo.name === ticker ? null : tickerInfo.ticker,
          source: sourceLink,
          price: getLastPrice(tickerInfo.id, true),
          priceSymbol: getSymbolByTicker(tickerInfo.currency),
        }),
        {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          disable_notification: muted,
          reply_markup: {
            inline_keyboard: shift.chat ? [] : keyboard,
          },
        }
      )
      .then(async () => {
        // Update last message candle time
        const dataToUpdate = isGrow
          ? { lastMessageCandleGrowTime: actualCandleCreatedTime }
          : { lastMessageCandleFallTime: actualCandleCreatedTime }

        // Update the flag indicating the message was sent
        await TimeShiftModel.updateOne(
          { _id: shift._id },
          {
            $set: dataToUpdate,
          }
        )
      })
      .catch(async (e) => {
        log.error(logPrefix, e)

        // If bot was blocked by user
        // TODO: Create middleware for this
        if (
          (e.code === 403 &&
            (e.description === 'Forbidden: bot was blocked by the user' ||
              e.description === 'Forbidden: user is deactivated')) ||
          // Bot was kicked
          (e.code === 400 && e.description === 'Bad Request: chat not found')
        ) {
          await TimeShiftModel.remove({ _id: shift._id })
          shiftsCache.update()

          log.info(logPrefix, 'Deleted shift because bot blocked by user')
        }

        if (
          e.description ===
            'Bad Request: group chat was upgraded to a supergroup chat' &&
          e.parameters?.migrate_to_chat_id &&
          shift.chat
        ) {
          // Update chat in time shift
          await TimeShiftModel.updateOne(
            { _id: shift._id },
            {
              $set: {
                chat: e.parameters?.migrate_to_chat_id,
              },
            }
          )
          // Update chat in Chat model
          await ChatModel.updateOne(
            { id: shift.chat },
            {
              $set: {
                id: e.parameters?.migrate_to_chat_id,
                type: 'supergroup',
              },
            }
          )
        }
      })
  }
}
