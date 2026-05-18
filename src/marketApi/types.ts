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
 * Common fields shared by list items when fetching basic data
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
