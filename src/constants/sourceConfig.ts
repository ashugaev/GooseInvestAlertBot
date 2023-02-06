import { EMarketDataSources } from '@/marketApi/types'

export interface SourceConfig {
  fullName: string
}

export const SOURCE_CONFIG: Record<EMarketDataSources, SourceConfig> = {
  [EMarketDataSources.tinkoff]: {
    fullName: 'Tinkoff'
  },
  [EMarketDataSources.coingecko]: {
    fullName: 'Coingecko'
  },
  [EMarketDataSources.binance]: {
    fullName: 'Binance'
  },
  [EMarketDataSources.yahoo]: {
    fullName: 'Yahoo'
  },
  [EMarketDataSources.bybit]: {
    fullName: 'Bybit'
  }
}
