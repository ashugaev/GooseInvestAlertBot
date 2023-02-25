import Telegraf, { Context } from 'telegraf'

import { log } from '@/helpers'
import { getSourceLink } from '@/helpers/getSourceLInk'
import { i18n } from '@/helpers/i18n'
import { symbolOrCurrency } from '@/helpers/symbolOrCurrency'
import { InstrumentsList, PriceAlert, priceAlertCache, removePriceAlert } from '@/models'

export const checkAlertTriggered = (alert: PriceAlert, price: number) => {
  const { lowerThen, greaterThen } = alert
  const isLowerThenTriggered = lowerThen && price <= lowerThen
  const isGreaterThenTriggered = greaterThen && price >= greaterThen

  return isLowerThenTriggered || isGreaterThenTriggered
}

export const sendTriggeredAlert = async (bot: Telegraf<Context>, alert: PriceAlert, instrumentData: InstrumentsList) => {
  const { message, lowerThen, greaterThen } = alert
  const alertPrice = lowerThen || greaterThen

  // Что бы не вызвать повторный триггер до того, как отработает удаление алерта в базе и апдейт кэша
  priceAlertCache.removeItemFromCache(alert._id)

  bot.telegram.sendMessage(alert.user,
    i18n.t('ru', 'priceChecker_triggeredAlert', {
      symbol: instrumentData.ticker,
      name: instrumentData.name,
      currency: symbolOrCurrency(alert.currency),
      greaterThen,
      price: alertPrice,
      message,
      link: getSourceLink(instrumentData)
    }),
    {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
    .then(async () => {
      await removePriceAlert({ _id: alert._id })
    })
    .catch(async (e) => {
      if (
        (e.code === 403 && e.description === 'Forbidden: bot was blocked by the user') ||
            (e.code === 403 && e.description === 'Forbidden: user is deactivated') ||
            (e.code === 400 && e.description === 'Bad Request: chat not found')
      ) {
        await removePriceAlert({ _id: alert._id })
        log.info('Алерт удален из-за блокировки юзером', alert)
      } else {
        log.error('Ошибка отправки сообщения юзеру', e)
      }
    })
}
