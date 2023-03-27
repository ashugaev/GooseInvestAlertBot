import * as process from 'process'

import { log } from '@/helpers'
import { getLastPrice } from '@/helpers/getLastPrice'
import { sayToBoss } from '@/helpers/sayToBoss'
import { EMarketDataSources } from '@/marketApi/types'
import { EMarketInstrumentTypes, PriceAlert, PriceAlertModel } from '@/models'
import { TINK_TRADING_DAYS, TINK_TRADING_HOURS } from '@/tests/tests.constants'

const logPrefix = '<b>TEST</b>'

const TEST_USER_ID = process.env.TEST_USER_TG_ID as unknown as number

interface Config {
  priceAlert: Partial<PriceAlert>
  checkAfter: number
  days?: { start: number, end: number }
  hours?: { start: number, end: number }
}

const CONFIG: Config[] = [
  {
    priceAlert: {
      user: TEST_USER_ID,
      symbol: 'YNDX',
      name: 'Yandex',
      currency: 'RUB',
      type: EMarketInstrumentTypes.Stock,
      source: EMarketDataSources.tinkoff,
      tickerId: 'BBG006L8G4H1'
    },
    checkAfter: 1000 * 60 * 30,
    days: TINK_TRADING_DAYS,
    hours: TINK_TRADING_HOURS
  },
  {
    priceAlert: {
      user: TEST_USER_ID,
      tickerId: 'bybit_BTCUSDT',
      symbol: 'BTCUSDT',
      name: 'BTCUSDT',
      currency: 'USDT',
      type: EMarketInstrumentTypes.Crypto,
      source: EMarketDataSources.bybit
    },
    checkAfter: 1000 * 60 * 2
  },
  {
    priceAlert: {
      user: TEST_USER_ID,
      tickerId: 'binance_BTCUSDT',
      symbol: 'BTCUSDT',
      name: 'BTCUSDT',
      currency: 'USDT',
      type: EMarketInstrumentTypes.Crypto,
      source: EMarketDataSources.binance
    },
    checkAfter: 1000 * 60 * 2
  }
]

export const testAlertsTriggered = async (bot) => {
  for (let i = 0; i < CONFIG.length; i++) {
    const itemConfig = CONFIG[i]

    const check = async () => {
      if (!TEST_USER_ID) {
        throw new Error('TEST_USER_TG_ID is not set')
      }

      try {
        // Skip if outside hours
        if (itemConfig.hours) {
          const currentHour = new Date().getHours()

          if (currentHour < itemConfig.hours.start || currentHour > itemConfig.hours.end) {
            return
          }
        }

        // Skip if outside days
        if (itemConfig.days) {
          const currentDay = new Date().getDay()

          if (currentDay < itemConfig.days.start || currentDay > itemConfig.days.end) {
            return
          }
        }

        const price = getLastPrice(itemConfig.priceAlert.tickerId, true) ?? null

        if (!price) {
          await sayToBoss({
            bot,
            message: logPrefix + ` 😱 No price for ${itemConfig.priceAlert.tickerId}}`
          })
        }

        // До создания потому что может не успеть сосчитать правильно до срабатывания
        const alertsCountById = await PriceAlertModel
          .count({ tickerId: itemConfig.priceAlert.tickerId, user: TEST_USER_ID }) + 2

        await PriceAlertModel.create({
          ...itemConfig.priceAlert,
          initialPrice: price,
          lowerThen: price * 0.99999
        }, {
          ...itemConfig.priceAlert,
          initialPrice: price,
          greaterThen: price * 1.00001
        })

        // Wait than check if one of alerts is triggered
        setTimeout(async () => {
          // Atleast one of alerts must be triggered
          const newAlertsCountById = await PriceAlertModel.count(
            { tickerId: itemConfig.priceAlert.tickerId, user: TEST_USER_ID }
          )

          if (newAlertsCountById === alertsCountById) {
            await sayToBoss({
              bot,
              message: logPrefix + ` 😱 Alerts is not working for ${itemConfig.priceAlert.tickerId}`
            })
          }

          // Clear alerts for this ticker
          await PriceAlertModel.remove({ tickerId: itemConfig.priceAlert.tickerId, user: TEST_USER_ID })
        }, itemConfig.checkAfter)
      } catch (e) {
        log.error('Price test crash', e)
      }
    }

    setInterval(check, itemConfig.checkAfter * 3)
  }
}
