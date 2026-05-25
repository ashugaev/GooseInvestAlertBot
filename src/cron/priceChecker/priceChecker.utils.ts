import { triggeredAlertKeyboad } from '@/commands/alert/keyboards/triggeredAlert'
import { alertMessage } from '@/commands/alert/messages/alert'
import { log } from '@/helpers'
import { getBot } from '@/helpers/bot'
import { isShutdownMode } from '@/helpers/isShutdownMode'
import {
  InstrumentsList,
  PriceAlert,
  priceAlertCache,
  removePriceAlert,
} from '@/models'

export const checkAlertTriggered = (alert: PriceAlert, price: number) => {
  const { lowerThen, greaterThen } = alert
  const isLowerThenTriggered = lowerThen && price <= lowerThen
  const isGreaterThenTriggered = greaterThen && price >= greaterThen

  return isLowerThenTriggered || isGreaterThenTriggered
}

export const sendTriggeredAlert = async (
  alert: PriceAlert,
  instrumentData: InstrumentsList
) => {
  // Kill switch: stop pushing alerts as soon as SHUTDOWN_MODE is on.
  // Skip before touching the cache / DB so the alert survives the freeze
  // and would re-trigger if the bot is ever brought back.
  if (isShutdownMode()) return

  const {
    message: _message,
    lowerThen: _lowerThen,
    greaterThen: _greaterThen,
    _id,
  } = alert

  // Prevent a re-trigger before the DB delete and cache update complete
  // @ts-ignore
  priceAlertCache.removeItemFromCache(_id.toString())

  const bot = await getBot(alert.botId)
  if (!bot) {
    log.error('Bot removed error. Handle this case gracefully!')
    return
  }
  bot.telegram
    .sendMessage(
      alert.chat ?? alert.user,
      alertMessage(alert, instrumentData),
      {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: triggeredAlertKeyboad({
            alert,
            clicked: false,
          }),
        },
      }
    )
    .then(async () => {
      await removePriceAlert({
        _id: alert._id,
        chat: alert.chat,
        triggered: true,
      })
    })
    .catch(async (e) => {
      if (
        (e.code === 403 &&
          e.description === 'Forbidden: bot was blocked by the user') ||
        (e.code === 403 &&
          e.description === 'Forbidden: user is deactivated') ||
        (e.code === 400 && e.description === 'Bad Request: chat not found')
      ) {
        await removePriceAlert({
          _id: alert._id,
          chat: alert.chat,
          removed: true,
        })
        log.info('Alert removed because the user blocked the bot', alert)
      } else {
        log.error('Failed to send message to user', e)
      }
    })
}
