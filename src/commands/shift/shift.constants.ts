import { EMarketDataSources } from '@/marketApi/types'

export const SHIFT_SCENES = {
  add: 'add',
  updatePercent: 'ggt',
}

// Рандомные симолы в экшене, что бы не выходить за лимит длины
export const SHIFT_ACTIONS = {
  chooseTimeframe: '4k',
  chooseSource: '88',
  additionalConfiguration: 'l4y5',
  alertSettings: 'lje',
  deleteOne: 'dde',
  changePercent: 'ttc',
}

export const SHIFT_MAX_PERCENT = 200

export interface ShiftTimeframe {
  timeframe: string
  name_ru: string
  lifetime: number
  name_ru_plur: string
}

export enum ESfhitTimeframes {
  '10S' = '10S',
  '15S' = '15S',
  '30S' = '30S',
  '1M' = '1M',
  '5M' = '5M',
  '15M' = '15M',
  '30M' = '30M',
  '1H' = '1H',
  '6H' = '6H',
  '1D' = '1D',
  '1W' = '1W',
}

export interface ShiftTimeframeConfig {
  minTimeframeTime: number
}

export const SHIFT_TIMEFRAMES: Record<ESfhitTimeframes, ShiftTimeframe> = {
  '10S': {
    timeframe: '10S',
    name_ru: '10 секунд',
    lifetime: 10000,
    name_ru_plur: '10 секунд',
  },
  '15S': {
    timeframe: '15S',
    name_ru: '15 секунд',
    lifetime: 15000,
    name_ru_plur: '15 секунд',
  },
  '30S': {
    timeframe: '30S',
    name_ru: '30 секунд',
    lifetime: 30000,
    name_ru_plur: '30 секунд',
  },
  '1M': {
    timeframe: '1M',
    name_ru: '1 минута',
    lifetime: 60000,
    name_ru_plur: '1 минуту',
  },
  '5M': {
    timeframe: '5M',
    name_ru: '5 минут',
    lifetime: 300000,
    name_ru_plur: '5 минут',
  },
  '15M': {
    timeframe: '15M',
    name_ru: '15 минут',
    lifetime: 900000,
    name_ru_plur: '15 минут',
  },
  '30M': {
    timeframe: '30M',
    name_ru: '30 минут',
    lifetime: 1800000,
    name_ru_plur: '30 минут',
  },
  '1H': {
    timeframe: '1H',
    name_ru: '1 час',
    lifetime: 3600000,
    name_ru_plur: '1 час',
  },
  '6H': {
    timeframe: '6H',
    lifetime: 21600000,
    name_ru_plur: '6 часов',
    name_ru: '6 часов',
  },
  '1D': {
    timeframe: '1D',
    name_ru: '1 день',
    lifetime: 86400000,
    name_ru_plur: '1 день',
  },
  '1W': {
    timeframe: '1W',
    name_ru: '1 неделя',
    lifetime: 604800000,
    name_ru_plur: '1 неделю',
  },
}

const SHIFT_SOURCES_CONFIG: Record<EMarketDataSources, ShiftTimeframeConfig> = {
  [EMarketDataSources.binance]: {
    minTimeframeTime: 5000,
  },
  [EMarketDataSources.bybit]: {
    minTimeframeTime: 5000,
  },
  [EMarketDataSources.coingecko]: {
    minTimeframeTime: 3600000,
  },
  [EMarketDataSources.tinkoff]: {
    minTimeframeTime: 30000,
  },
  // [EMarketDataSources.yahoo]: {
  //   minTimeframeTime: 3600000,
  // },
  [EMarketDataSources.kucoin]: {
    minTimeframeTime: 60000,
  },
  [EMarketDataSources.lbank]: {
    minTimeframeTime: 30000,
  },
  [EMarketDataSources.binanceFuture]: {
    minTimeframeTime: 5000,
  },
}

export const SHIFT_TIMEFRAMES_ARRAY = Object.values(SHIFT_TIMEFRAMES)

/**
 * Config for timeframes by every source
 */
// @ts-expect-error FIXME
// eslint-disable-next-line max-len
export const SHIFT_TIMEFRAMES_BY_SOURCE_CONFIG: Record<
  EMarketDataSources,
  ShiftTimeframe[]
> = Object.keys(EMarketDataSources).reduce<
  Record<EMarketDataSources, ShiftTimeframe[]>
>((acc, source: EMarketDataSources) => {
  acc[source] = SHIFT_TIMEFRAMES_ARRAY.filter(
    (el) => el.lifetime >= SHIFT_SOURCES_CONFIG[source].minTimeframeTime
  )
  return acc
  // @ts-expect-error
}, {})
