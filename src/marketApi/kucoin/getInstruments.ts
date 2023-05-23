
import {countDigitsAfterDecimal} from "@/helpers/coundDigitsAfterDecimal"
import {KucoinAPI} from "@/marketApi/kucoin/index"
import {EMarketDataSources} from "@/marketApi/types"
import {EMarketInstrumentTypes, InstrumentsList} from "@/models"

export interface KucoinSymbolInfo {
    symbol: string
    name: string
    baseCurrency: string
    quoteCurrency: string
    feeCurrency: string
    market: string
    baseMinSize: string
    quoteMinSize: string
    baseMaxSize: string
    quoteMaxSize: string
    baseIncrement: string
    quoteIncrement: string
    priceIncrement: string
    priceLimitRate: string
    minFunds: string
    isMarginEnabled: boolean
    enableTrading: boolean
}

const normalizeItem = (item: KucoinSymbolInfo): InstrumentsList => {
  const {baseCurrency, quoteCurrency, priceIncrement  } = item

  const ticker = baseCurrency + quoteCurrency

  const result = {
    id: `kukoin_${ticker}`,
    source: EMarketDataSources.kucoin,
    currency: quoteCurrency,
    name:ticker,
    ticker: ticker,
    type: EMarketInstrumentTypes.Crypto,
    priceScale: countDigitsAfterDecimal(priceIncrement),
    sourceSpecificData: item,
  }

  return result
}


// @ts-ignore
export const getInstrumentsKucoin = async (): Promise<InstrumentsList[]> => {
  const {data} = await KucoinAPI.rest.Market.Symbols.getSymbolsList()

  const normalizedInstrumentsArray = (data as KucoinSymbolInfo[]).map(normalizeItem)
    
  return normalizedInstrumentsArray
}