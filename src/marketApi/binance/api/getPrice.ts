import { binance } from '../utils/binance'
const NodeCache = require('node-cache')

const getBinanceAllPricesCache = new NodeCache({
  stdTTL: 90
})

export const getBinanceAllPrices = async () => {
  let prices = getBinanceAllPricesCache.get('prices')

  if (!prices) {
    prices = await binance.prices()

    getBinanceAllPricesCache.set('prices', prices)
  }

  return prices
}

export const getBinanceCoinLastPrice = async (symbol) => {
  const prices = await getBinanceAllPrices()

  const symbolPrice = prices[symbol]

  if (symbolPrice) {
    throw new Error('[GetPrice] Can\'t get symbol price')
  }

  return symbolPrice
}
