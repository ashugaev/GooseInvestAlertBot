import { EMarketDataSources, EMarketInstrumentTypes, IBaseInstrumentData } from '../../types'
import { binance } from '../utils/binance'

const normalizeBinanceItem = (item): IBaseInstrumentData => {
  return {
    source: EMarketDataSources.binance,
    name: item.symbol,
    ticker: item.symbol,
    type: EMarketInstrumentTypes.Crypto,
    sourceSpecificData: {
      baseAsset: item.baseAsset,
      quoteAsset: item.quoteAsset
    }
  }
}

export const binanceGetAllInstruments = async () => {
  const result = await binance.exchangeInfo()

  return result.symbols.map(normalizeBinanceItem)
}
