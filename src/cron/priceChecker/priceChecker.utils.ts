
import { log } from '@/helpers'
import {getBot} from "@/helpers/bot"
import { getSourceMark } from '@/helpers/getSourceMark'
import { i18n } from '@/helpers/i18n'
import { symbolOrCurrency } from '@/helpers/symbolOrCurrency'
import { InstrumentsList, PriceAlert, priceAlertCache, removePriceAlert } from '@/models'

export const checkAlertTriggered = (alert: PriceAlert, price: number) => {
  const { lowerThen, greaterThen } = alert
  const isLowerThenTriggered = lowerThen && price <= lowerThen
  const isGreaterThenTriggered = greaterThen && price >= greaterThen

  return isLowerThenTriggered || isGreaterThenTriggered
}

export const sendTriggeredAlert = async (alert: PriceAlert, instrumentData: InstrumentsList) => {
  const { message, lowerThen, greaterThen, _id } = alert
  const alertPrice = lowerThen || greaterThen

  // Что бы не вызвать повторный триггер до того, как отработает удаление алерта в базе и апдейт кэша
  // @ts-ignore
  priceAlertCache.removeItemFromCache(_id)
  
  const bot = (await getBot(alert.botId))
  if(!bot) {
    log.error('Bot removed error. Handle this case gracefully!')
    return
  }    
  bot.telegram
    .sendMessage(alert.user,
      i18n.t('ru', 'priceChecker_triggeredAlert', {
        symbol: instrumentData.ticker,
        name: instrumentData.name,
        currency: symbolOrCurrency(alert.currency),
        greaterThen,
        price: alertPrice,
        message,
        link: getSourceMark(instrumentData)
      }),
      {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    .then(async () => {
      await removePriceAlert({ _id: alert._id, chat: alert.chat })
    })
    .catch(async (e) => {
      if (
        (e.code === 403 && e.description === 'Forbidden: bot was blocked by the user') ||
            (e.code === 403 && e.description === 'Forbidden: user is deactivated') ||
            (e.code === 400 && e.description === 'Bad Request: chat not found')
      ) {
        await removePriceAlert({ _id: alert._id, chat: alert.chat })
        log.info('Алерт удален из-за блокировки юзером', alert)
      } else {
        log.error('Ошибка отправки сообщения юзеру', e)
      }
    })
}
