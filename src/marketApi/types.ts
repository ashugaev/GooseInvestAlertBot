import { EMarketInstrumentTypes } from '@/models'

import { ICoingecoSpecificBaseData } from './coingecko/types'
import { ITinkoffSpecificBaseData } from './tinkoff/types'

export enum EMarketDataSources {
  tinkoff = 'tinkoff',
  coingecko = 'coingecko',
  binance = 'binance',
  /**
   * https://www.currencyconverterapi.com/docs
   */
  yahoo = 'yahoo',
  bybit = 'bybit',
  kucoin = 'kucoin',
}

/**
 * Данные, которые пересекаются у элементов в списке при получении базовых данных
 */
export interface IBaseInstrumentData {
  ticker: string
  name: string
  source: EMarketDataSources
  type: EMarketInstrumentTypes
  sourceSpecificData: ICoingecoSpecificBaseData | ITinkoffSpecificBaseData
}

export interface IMarketDataSourcesConfig {
  name: string
  requestsPerMinuteLimit: number
}
