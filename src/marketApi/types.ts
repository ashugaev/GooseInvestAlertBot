import { ICoingecoSpecificBaseData } from './coingecko/types';
import { ITinkoffSpecificBaseData } from './tinkoff/types';

export enum EMarketDataSources {
  tinkoff = 'tinkoff',
  coingecko = 'coingecko'
}

// TODO: Можно взять тиньковский тип, вроде там то же самое
export enum EMarketInstrumentTypes {
  Stock = 'Stock',
  Crypto = 'Crypto',
  Currency = 'Currency'
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
