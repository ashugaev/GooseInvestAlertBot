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
    shortName: 'TNKF',
  },
  [EMarketDataSources.coingecko]: {
    fullName: 'Coingecko',
    shortName: 'COINGECKO',
  },
  [EMarketDataSources.binance]: {
    fullName: 'Binance',
    shortName: 'BINANCE',
  },
  [EMarketDataSources.binanceFuture]: {
    fullName: 'Binance Futures',
    shortName: 'BINANCE FT',
  },
  // [EMarketDataSources.yahoo]: {
  //   fullName: 'Yahoo',
  //   shortName: 'YH',
  // },
  [EMarketDataSources.bybit]: {
    fullName: 'Bybit',
    shortName: 'BYBIT',
  },
  [EMarketDataSources.kucoin]: {
    fullName: 'Kucoin',
    shortName: 'KUCOIN',
  },
  [EMarketDataSources.lbank]: {
    fullName: 'LBank',
    shortName: 'LBANK',
  },
}
