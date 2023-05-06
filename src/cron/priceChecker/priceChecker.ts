import { checkAlertTriggered, sendTriggeredAlert } from '@/cron/priceChecker/priceChecker.utils'
import { log } from '@/helpers'
import { fnTimeAsync } from '@/helpers/fnTime'
import { getLastPrice } from '@/helpers/getLastPrice'
import { retryUntilTrue } from '@/helpers/retryUntilTrue'
import { wait } from '@/helpers/wait'
import {
  getInstrumentByIdFromCache, PriceAlert,
  priceAlertCache
} from '@/models'

const logPrefix = '[CHECK ALERTS]'
const itemsCheckTime = 500

export const setupPriceChecker = async () => {
  await retryUntilTrue(() => priceAlertCache.isReady, logPrefix + ' setupPriceChecker')

  while (true) {
    try {
      await fnTimeAsync(async () => {
        const checkStart = Date.now()

        if (!priceAlertCache.get.length) {
          log.error(logPrefix, 'Нет алертов для проверки')
          await wait(1000)
          return
        }

        // Log data
        const alertsFailedToCheckList = []
        const alertsTriggeredList = []

        for (let i = 0; i < priceAlertCache.get.length; i++) {
          const alert: PriceAlert = priceAlertCache.get[i]

          try {
            // No throw there for save logs size
            if (!alert) {
              alertsFailedToCheckList.push(alert.tickerId + ':' + alert.user.toString())
              continue
            }
            const instrumentData = await getInstrumentByIdFromCache(alert.tickerId, true, true)
            if (!instrumentData) {
              alertsFailedToCheckList.push(alert.tickerId + ':' + alert.user.toString())
              continue
            }
            const lastPrice = getLastPrice(alert.tickerId, true)
            if (!lastPrice) {
              alertsFailedToCheckList.push(alert.tickerId + ':' + alert.user.toString())
              continue
            }

            // Отчасти это какой-то пережиток, но может пригодиться для новых не проверенных апи
            const isPriceValidValue = typeof lastPrice === 'number' && lastPrice > 0
            if (!isPriceValidValue) {
              throw new Error(logPrefix + ' Невалидная цена инструмента')
            }

            const isAlertTriggered = checkAlertTriggered(alert, lastPrice)

            if (isAlertTriggered) {
              alertsTriggeredList.push(alert.tickerId + ':' + alert.user.toString())

              // NO AWAIT FOR PERFORMANCE
              sendTriggeredAlert(alert, instrumentData)
            }
          } catch (e) {
            alertsFailedToCheckList.push(alert.tickerId + ':' + alert.user.toString())
            log.error(logPrefix, 'Ошибка обработки алертов', e)
          }
        }

        if (alertsTriggeredList.length) {
          log.info(logPrefix, 'Triggered alerts', alertsTriggeredList)
        }

        // FIXME: Уменьшить количество, что бы поддерживать минимум мертвых алертов
        if (alertsFailedToCheckList.length > 150) {
          log.error(
            logPrefix,
            'Failed to check alerts',
            alertsFailedToCheckList.length, '/', priceAlertCache.get.length
          )
        }

        const timeToWait = itemsCheckTime - (Date.now() - checkStart)
        if (timeToWait > 0) {
          await wait(timeToWait)
        }
      }, logPrefix + ' Проверка срабатывания алертов')
    } catch (e) {
      log.error(logPrefix + 'SUPERCRASH Падает мониториг цен', e)
      await wait(1000)
    }
  }
}
