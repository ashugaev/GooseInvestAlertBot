import {
  ExchangeInfo,
  FuturesOrderType_LT,
  OrderType_LT,
  Symbol,
} from 'binance-api-node'

import { log } from '../../../helpers/log'
import { wait } from '../../../helpers/wait'
import { EMarketInstrumentTypes, InstrumentsList } from '../../../models'
import { EMarketDataSources } from '../../types'
import { binance } from '../utils/binance'

// eslint-disable-next-line
export type BinanceTickerItem = Symbol<OrderType_LT | FuturesOrderType_LT>
export type BinanceSourceSpecificData = Omit<
  BinanceTickerItem,
  'quoteAsset' | 'symbol'
>

const normalizeItem = (item: BinanceTickerItem): InstrumentsList => {
  const { symbol, quoteAsset, ...specificData } = item

  const result = {
    id: `binance_${symbol}`,
    source: EMarketDataSources.binance,
    currency: quoteAsset,
    name: symbol,
    ticker: symbol,
    type: EMarketInstrumentTypes.Crypto,
    sourceSpecificData: specificData,
    priceScale: null,
  }

  return result
}

export const binanceGetAllInstruments = async () => {
  try {
    const data: ExchangeInfo = await binance.exchangeInfo()

    const symbols = data.symbols

    const normalizedInstrumentsArray = symbols.map(normalizeItem)

    return normalizedInstrumentsArray
  } catch (e) {
    log.error('Failed to load Binance instruments list:', e)

    await wait(30000)

    // Retry
    return binanceGetAllInstruments()
  }
}
