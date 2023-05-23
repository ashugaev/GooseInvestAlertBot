import { log } from '@/helpers'
import { getLastPrice } from '@/helpers/getLastPrice'
import { getSourceMark } from '@/helpers/getSourceMark'
import { sayToBoss } from '@/helpers/sayToBoss'
import { EMarketDataSources } from '@/marketApi/types'
import { EMarketInstrumentTypes, InstrumentsList, InstrumentsListModel } from '@/models'
import { TINK_TRADING_DAYS, TINK_TRADING_HOURS } from '@/tests/tests.constants'

const CHECKED_PRICES = {}

interface TestItem {
  params: Partial<InstrumentsList>
  hours?: { start: number, end: number }
  days?: { start: number, end: number }
  checkPeriod: number
}

const testTickers: TestItem[] = [
  {
    params: {
      source: EMarketDataSources.bybit, ticker: 'BTCUSDT'
    },
    checkPeriod: 1000 * 60 * 10
  },
  {
    params: { source: EMarketDataSources.bybit, ticker: 'ETHUSDT' },
    checkPeriod: 1000 * 60 * 10
  },
  {
    params: { source: EMarketDataSources.binance, ticker: 'BTCUSDT' },
    checkPeriod: 1000 * 60 * 10
  },
  {
    params: { source: EMarketDataSources.binance, ticker: 'ETHUSDT' },
    checkPeriod: 1000 * 60 * 10
  },
  {
    params: { source: EMarketDataSources.kucoin, ticker: 'BTCUSDT' },
    checkPeriod: 1000 * 60 * 10
  },
  {
    params: { source: EMarketDataSources.kucoin, ticker: 'ETHUSDT' },
    checkPeriod: 1000 * 60 * 10
  },
  {
    params: { source: EMarketDataSources.tinkoff, type: EMarketInstrumentTypes.Currency, ticker: 'USDRUB' },
    hours: TINK_TRADING_HOURS,
    days: TINK_TRADING_DAYS,
    checkPeriod: 1000 * 60 * 10
  },
  {
    params: { source: EMarketDataSources.tinkoff, type: EMarketInstrumentTypes.Stock, ticker: 'YNDX' },
    hours: TINK_TRADING_HOURS,
    days: TINK_TRADING_DAYS,
    checkPeriod: 1000 * 60 * 30
  },
  // FIXME: Return when will be fixed
  // {
  //   params: { source: EMarketDataSources.yahoo, ticker: 'USDRUB' },
  //   checkPeriod: 1000 * 60 * 90
  // },
  // {
  //   params: { source: EMarketDataSources.yahoo, ticker: 'EURUSD' },
  //   checkPeriod: 1000 * 60 * 90
  // },
  {
    params: { source: EMarketDataSources.coingecko, ticker: 'ETH' },
    checkPeriod: 1000 * 60 * 60
  },
  {
    params: { source: EMarketDataSources.coingecko, ticker: 'BTC' },
    checkPeriod: 1000 * 60 * 60
  }
]

export const testPriceUpdater = async () => {
  for (let i = 0; i < testTickers.length; i++) {
    const itemConfig = testTickers[i]

    const checkPrice = async () => {
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

        const instrumentInfo: InstrumentsList = (await InstrumentsListModel.find(itemConfig.params).lean())[0]
        const price = getLastPrice(instrumentInfo.id, true) ?? null

        if (!instrumentInfo) {
          await sayToBoss({
            message: `😱 No instrumentInfo for ${itemConfig.params.ticker} [${itemConfig.params.source}]`
          })
        }

        if (!price) {
          await sayToBoss({
            message: `😱 No price for ${instrumentInfo.ticker} ${getSourceMark(instrumentInfo)}`
          })
        }

        if (price === CHECKED_PRICES[instrumentInfo.id]) {
          await sayToBoss({
            message: `😱 Price for ${instrumentInfo.ticker} ${getSourceMark(instrumentInfo)} is the same`
          })
        } else {
          CHECKED_PRICES[instrumentInfo.id] = price
        }
      } catch (e) {
        log.error('Price test crash', e)
      }
    }

    setInterval(checkPrice, itemConfig.checkPeriod)
  }
}
