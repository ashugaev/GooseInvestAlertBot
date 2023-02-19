import { EMarketDataSources } from '@/marketApi/types'

export interface SourceConfig {
  fullName: string
  /**
   * Short name for UI
   */
  shortName: string
}

export const SOURCE_CONFIG: Record<EMarketDataSources, SourceConfig> = {
  [EMarketDataSources.tinkoff]: {
    fullName: 'Tinkoff',
    shortName: 'TNKF'
  },
  [EMarketDataSources.coingecko]: {
    fullName: 'Coingecko',
    shortName: 'COINGECKO'
  },
  [EMarketDataSources.binance]: {
    fullName: 'Binance',
    shortName: 'BINANCE'
  },
  [EMarketDataSources.yahoo]: {
    fullName: 'Yahoo',
    shortName: 'YH'
  },
  [EMarketDataSources.bybit]: {
    fullName: 'Bybit',
    shortName: 'BYBIT'
  }
}
