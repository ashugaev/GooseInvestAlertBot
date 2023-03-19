import { getLastPrice } from '@/helpers/getLastPrice'
import { getSourceMark } from '@/helpers/getSourceMark'
import { sayToBoss } from '@/helpers/sayToBoss'
import { wait } from '@/helpers/wait'
import { EMarketDataSources } from '@/marketApi/types'
import { EMarketInstrumentTypes, InstrumentsList, InstrumentsListModel } from '@/models'

const START_BOT_TIME = Date.now()

const CHECKED_PRICES = {

}

const CHECKED_CANDLES = {

}

const testTickers: Array<Partial<InstrumentsList>> = [
  { source: EMarketDataSources.bybit, ticker: 'BTCUSDT' },
  { source: EMarketDataSources.bybit, ticker: 'ETHUSDT' },

  { source: EMarketDataSources.binance, ticker: 'BTCUSDT' },
  { source: EMarketDataSources.binance, ticker: 'ETHUSDT' },

  { source: EMarketDataSources.tinkoff, type: EMarketInstrumentTypes.Currency, ticker: 'USDRUB' },
  // { source: EMarketDataSources.tinkoff, type: EMarketInstrumentTypes.Stock, ticker: 'YNDX' },

  // { source: EMarketDataSources.yahoo, ticker: 'USDRUB' },
  // { source: EMarketDataSources.yahoo, ticker: 'EURUSD' },

  { source: EMarketDataSources.coingecko, ticker: 'ETH' },
  { source: EMarketDataSources.coingecko, ticker: 'BTC' }
]

export const testPriceUpdater = async (bot) => {
  while (true) {
    // Start checking after 5 minutes
    if (Date.now() - START_BOT_TIME < 1000 * 60 * 5) {
      await wait(1000 * 60)
      continue
    }

    for (let i = 0; i < testTickers.length; i++) {
      const itemConfig = testTickers[i]
      const instrumentInfo: InstrumentsList = (await InstrumentsListModel.find(itemConfig).lean())[0]

      const price = getLastPrice(instrumentInfo.id, true) ?? null

      if (!instrumentInfo) {
        await sayToBoss({
          bot,
          message: `😱 No instrumentInfo for ${itemConfig.ticker} [${itemConfig.source}]`
        })
      }

      if (!price) {
        await sayToBoss({
          bot,
          message: `😱 No price for ${instrumentInfo.ticker} ${getSourceMark(instrumentInfo)}`
        })
      }

      if (price === CHECKED_PRICES[instrumentInfo.id]) {
        await sayToBoss({
          bot,
          message: `😱 Price for ${instrumentInfo.ticker} ${getSourceMark(instrumentInfo)} is the same`
        })
      } else {
        CHECKED_PRICES[instrumentInfo.id] = price
      }
    }

    await wait(1000 * 60 * 10)
  }
}
