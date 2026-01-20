import { EMarketInstrumentTypes } from '@/models'

import { ITinkoffSpecificBaseData } from './tinkoff/types'

export enum EMarketDataSources {
  tinkoff = 'tinkoff',
  binance = 'binance',
  binanceFuture = 'binanceFuture',
  /**
   * https://www.currencyconverterapi.com/docs
   */
  // yahoo = 'yahoo',
  bybit = 'bybit',
  kucoin = 'kucoin',
  lbank = 'lbank',
}

/**
 * Данные, которые пересекаются у элементов в списке при получении базовых данных
 */
export interface IBaseInstrumentData {
  ticker: string
  name: string
  source: EMarketDataSources
  type: EMarketInstrumentTypes
  sourceSpecificData: ITinkoffSpecificBaseData
}

export interface IMarketDataSourcesConfig {
  name: string
  requestsPerMinuteLimit: number
}
