import { ExchangeInfo, FuturesOrderType_LT } from 'binance-api-node'

import { BinanceTickerItem } from '@/marketApi/binance/api/getAllInstruments'

import { log } from '../../../helpers/log'
import { wait } from '../../../helpers/wait'
import { EMarketInstrumentTypes, InstrumentsList } from '../../../models'
import { EMarketDataSources } from '../../types'
import { binance } from '../utils/binance'

const normalizeItem = (item: BinanceTickerItem): InstrumentsList => {
  const { symbol, quoteAsset, ...specificData } = item

  const result = {
    id: `binanceFuture_${symbol}`,
    source: EMarketDataSources.binanceFuture,
    currency: quoteAsset,
    name: symbol,
    ticker: symbol,
    type: EMarketInstrumentTypes.Crypto,
    sourceSpecificData: specificData,
    priceScale: null,
  }

  return result
}

export const binanceGetAllInstrumentsFutures = async () => {
  try {
    const data: ExchangeInfo<FuturesOrderType_LT> =
      await binance.futuresExchangeInfo()

    const symbols = data.symbols

    const normalizedInstrumentsArray = symbols.map(normalizeItem)

    return normalizedInstrumentsArray
  } catch (e) {
    log.error('Failed to load Binance instruments list:', e)

    await wait(30000)

    // Retry
    return binanceGetAllInstrumentsFutures()
  }
}
