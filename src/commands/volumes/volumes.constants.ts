import { EMarketDataSources } from '@/marketApi/types'

export const VOLUME_SCENES = {
  add: '43f',
}

export const VOLUME_ACTIONS = {
  chooseSource: 'dvk',
}

interface VolumeConfigBySource {
  minTimeframeTime: number
  enabled: boolean
}

export const VOLUME_SOURCES_CONFIG: Record<
  EMarketDataSources,
  VolumeConfigBySource
> = {
  [EMarketDataSources.binance]: {
    minTimeframeTime: 5000,
    enabled: false,
  },
  [EMarketDataSources.bybit]: {
    minTimeframeTime: 5000,
    enabled: false,
  },
  [EMarketDataSources.coingecko]: {
    minTimeframeTime: 3600000,
    enabled: false,
  },
  [EMarketDataSources.tinkoff]: {
    minTimeframeTime: 30000,
    enabled: true,
  },
  // [EMarketDataSources.yahoo]: {
  //   minTimeframeTime: 3600000,
  // },
  [EMarketDataSources.kucoin]: {
    minTimeframeTime: 60000,
    enabled: false,
  },
  [EMarketDataSources.lbank]: {
    minTimeframeTime: 30000,
    enabled: false,
  },
  [EMarketDataSources.binanceFuture]: {
    minTimeframeTime: 5000,
    enabled: false,
  },
}
