import { getInstrumentDataWithPrice } from '../../helpers/getInstrumentData'
import { symbolOrCurrency } from '../../helpers/symbolOrCurrency'
import { wait } from '../../helpers/wait'
import { getUniqSymbols, checkAlerts, getAlerts, removePriceAlert } from '../../models'
import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log'
import { getInstrumentLink } from '../../helpers/getInstrumentLInk'

let lastApiErrorSentrySentTime = 0

export const setupPriceChecker = async (bot) => {
  // Ожидание преред запуском что бы не спамить на хотрелоаде
  // и успеть выполнить подготовительные ф-ции
  await wait(30000)

  while (true) {
    try {
      let symbols = []

      try {
        symbols = await getUniqSymbols(50)
      } catch (e) {
        log.error('[setupPriceChecker] ошибка подключения к базе', e)
      }

      // Если пока нечего проверять
      if (!symbols?.length) {
        await wait(30000)
        continue
      } else {
        log.debug('Проверяю символы', symbols)
      }

      for (let i = 0; symbols.length > i; i++) {
        const symbol = symbols[i]

        const removeAlertsForSymbol = false
        let price
        let instrumentData

        try {
          const result = await getInstrumentDataWithPrice({ symbol })

          instrumentData = result.instrumentData
          price = result.price

          log.info(`${symbol}:${price}`)

          const isPriceValidValue = typeof price === 'number' && price > 0

          if (!isPriceValidValue) {
            throw new Error('Невалидная цена инструмента')
          }
        } catch (e) {
        // Сейчас этот if не будет срабатывать из-за того хожу теперь в базу а не в апи за данными инструмента
          if (typeof e === 'object' && e !== null && e.cantFind) {
          // FIXME: Пока закомментил. Слишком опасное место.
          //  Потенциально может выкосить все алерты
          // removeAlertsForSymbol = true

            log.error('Инструмент не найдет в апи', e)
          } else {
            const currentTime = new Date().getTime()

            // Если прошло больше часа
            const noSentry = (currentTime - lastApiErrorSentrySentTime) < 3600000

            if (noSentry) {
              console.error('[PriceChecker] Ошибка получания цены для инструмента', e)

              continue
            } else {
            // У логгера под капотом отправка сообщения в sentry
              log.error('[PriceChecker] Ошибка получания цены для инструмента', e)

              lastApiErrorSentrySentTime = currentTime
            }
          }

          continue
        }

        // Если инструмента больше нет в апи
        if (removeAlertsForSymbol) {
          log.debug('Удаляю все по символу', symbol)

          const alertsToRemove = await getAlerts({ symbol })

          for (let j = 0; alertsToRemove.length > j; j++) {
            const alert = alertsToRemove[j]

            try {
            // TODO: Удалаять алерт после нескольки падений отправки
            //  Сейчас удалится даже если упадет отрпавка сообщения
              await removePriceAlert({ _id: alert._id })

              await bot.telegram.sendMessage(alert.user, i18n.t(
                'ru', 'priceCheckerErrorCantFind',
                { price: alert.lowerThen || alert.greaterThen, symbol: alert.symbol }
              ),
              {
                parse_mode: 'HTML'
              }
              )
            } catch (e) {
              log.error('Ошибка отправки сообщения юзеру', e)
            }
          }

          continue
        }

        let triggeredAlerts = []

        try {
          triggeredAlerts = await checkAlerts({ symbol, price })
        } catch (e) {
          log.error('ошибка получения алертов', 'price', price, 'symbol', symbol, 'error', e)

          continue
        }

        if (triggeredAlerts?.length) {
          log.debug('Сработали алерты', triggeredAlerts, ' Цена: ', price, ' Символ:', symbol)

          for (let j = 0; triggeredAlerts.length > j; j++) {
            const alert = triggeredAlerts[j]
            const { message, symbol, lowerThen, greaterThen, type, source } = alert
            const price = lowerThen || greaterThen

            try {
              await bot.telegram.sendMessage(alert.user,
                i18n.t('ru', 'priceChecker_triggeredAlert', {
                  symbol: instrumentData.ticker,
                  name: instrumentData.name,
                  currency: symbolOrCurrency(alert.currency),
                  greaterThen,
                  price,
                  message,
                  link: type && getInstrumentLink({ type, ticker: symbol, source })
                }),
                {
                  parse_mode: 'HTML',
                  disable_web_page_preview: true
                })

              // TODO: Удалаять алерт после нескольки падений отправки
              await removePriceAlert({ _id: alert._id })
            } catch (e) {
            // Если юзер блокнул бота
              if (e.code === 403) {
                try {
                  await removePriceAlert({ _id: alert._id })
                  log.info('Алерт удален из-за блокировки юзером', alert)
                } catch (e) {
                  log.error('Ошибка удаления алерта', e)
                }
              } else {
                log.error('Ошибка отправки сообщения юзеру', e)
              }
            }
          }
        }
      }
    } catch (e) {
      log.error('[SUPER_CRASH] Падает мониториг цен', e)
      await wait(10000)
    }
  }
}
