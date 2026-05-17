import axios from 'axios'

import { responseCache } from './currenciesListResponseCache'

const NodeCache = require('node-cache')

const logPrefix = '[GET LIST]'

interface CurrencyListApiResponseItem {
  symbol: string
  name: string
  symbol_native: string
  decimal_digits: number
  rounding: number
  code: string
  name_plural: string
}

export interface CurrencyApiSpecificData {
  symbol: string
  baseAssetData: CurrencyListApiResponseItem
  quoteAssetData: CurrencyListApiResponseItem
}

const deprecatedCodes = ['BTC', 'ETH', 'BIH', 'GGP']

const coinTickersCache = new NodeCache({
  stdTTL: 1000, // sec
})

const COINS_TICKERS_CACHE_KEY = 'KEY'

export const getBaseCurrencies = async () => {
  let result = null

  try {
    result = coinTickersCache.get(COINS_TICKERS_CACHE_KEY)

    if (!result) {
      // eslint-disable-next-line max-len
      result = (
        await axios(
          `https://api.currencyapi.com/v3/currencies?apikey=${process.env.CURRENCY_CONVERTER_APIKEY}&currencies=`
        )
      ).data
    }

    if (!result) {
      throw new Error(logPrefix + " Can't fetch currencies")
    }

    coinTickersCache.set(COINS_TICKERS_CACHE_KEY, result)
  } catch (e) {
    console.error(logPrefix, 'Currencies API failed', e)
    result = responseCache
  }

  deprecatedCodes.forEach((code) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete result.data[code]
  })

  return result
}
