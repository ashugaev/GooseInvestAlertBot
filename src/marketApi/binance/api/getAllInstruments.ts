import { ExchangeInfo, OrderType_LT, Symbol } from 'binance-api-node'

import { log } from '../../../helpers/log'
import { wait } from '../../../helpers/wait'
import { EMarketInstrumentTypes, InstrumentsList } from '../../../models'
import { EMarketDataSources } from '../../types'
import { binance } from '../utils/binance'

export type BinanceTickerItem = Symbol<OrderType_LT>
export type BinanceSourceSpecificData = Omit<BinanceTickerItem, 'quoteAsset' | 'symbol'>

const normalizeItem = (item: BinanceTickerItem): InstrumentsList => {
  const { symbol, quoteAsset, ...specificData } = item

  const result = {
    id: `binance_${symbol}`,
    source: EMarketDataSources.binance,
    currency: quoteAsset,
    name: symbol,
    ticker: symbol,
    type: EMarketInstrumentTypes.Crypto,
    sourceSpecificData: specificData
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
    log.error('Ошибка получения списка инструментов binance:', e)

    await wait(30000)

    // Ретрай
    return binanceGetAllInstruments()
  }
}
