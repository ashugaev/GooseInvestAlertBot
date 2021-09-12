import { IBinanceSpecificInstrumentData } from "./binance/types";
import { ICoingecoSpecificBaseData } from './coingecko/types'
import { ITinkoffSpecificBaseData } from './tinkoff/types'

export enum EMarketDataSources {
  tinkoff = 'tinkoff',
  coingecko = 'coingecko',
  binance = 'binance'
}

export enum EMarketInstrumentTypes {
  Stock = 'Stock',
  Crypto = 'Crypto'
}

/**
 * Данные, которые пересекаются у элементов в списке при получении базовых данных
 */
export interface IBaseInstrumentData {
  ticker: string
  name: string
  source: EMarketDataSources
  type: EMarketInstrumentTypes
  sourceSpecificData: ICoingecoSpecificBaseData | ITinkoffSpecificBaseData | IBinanceSpecificInstrumentData
}

export interface IMarketDataSourcesConfig {
  name: string
  requestsPerMinuteLimit: number
}
