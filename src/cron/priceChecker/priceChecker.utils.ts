import { triggeredAlertKeyboad } from '@/commands/alert/keyboards/triggeredAlert'
import { alertMessage } from '@/commands/alert/messages/alert'
import { log } from '@/helpers'
import { getBot } from '@/helpers/bot'
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
  const { message, lowerThen, greaterThen, _id } = alert

  // Что бы не вызвать повторный триггер до того, как отработает удаление алерта в базе и апдейт кэша
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
        log.info('Алерт удален из-за блокировки юзером', alert)
      } else {
        log.error('Ошибка отправки сообщения юзеру', e)
      }
    })
}
