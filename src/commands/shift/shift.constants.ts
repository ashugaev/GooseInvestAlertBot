import { EMarketDataSources } from '@/marketApi/types'

export const SHIFT_SCENES = {
  add: 'add'
}

// Рандомные симолы в экшене, что бы не выходить за лимит длины
export const SHIFT_ACTIONS = {
  chooseTimeframe: 'chooseTimeframe',
  chooseSource: 'chooseSource',
  additionalConfiguration: 'l4y5',
  alertSettings: 'lakje'
}

export const SHIFT_MAX_PERCENT = 200

export interface ShiftTimeframe {
  timeframe: string
  name_ru: string
  lifetime: number
  name_ru_plur: string
}

export enum ESfhitTimeframes {
  // '1MIN' = '1MIN',
  '5MIN' = '5MIN',
  '15MIN' = '15MIN',
  '30MIN' = '30MIN',
  '1H' = '1H',
  '6H' = '6H',
  '1D' = '1D',
  '1W' = '1W',
}

export interface ShiftTimeframeConfig {
  minTimeframeTime: number
}

export const SHIFT_TIMEFRAMES: Record<ESfhitTimeframes, ShiftTimeframe> = {
  // FIXME: Вернуть после опти
  // '1MIN': {
  //   timeframe: '1MIN',
  //   name_ru: '1 минута',
  //   lifetime: 60000,
  //   name_ru_plur: '1 минуту'
  // },
  '5MIN': {
    timeframe: '5MIN',
    name_ru: '5 минут',
    lifetime: 300000,
    name_ru_plur: '5 минут'
  },
  '15MIN': {
    timeframe: '15M',
    name_ru: '15 минут',
    lifetime: 900000,
    name_ru_plur: '15 минут'
  },
  '30MIN': {
    timeframe: '30MIN',
    name_ru: '30 минут',
    lifetime: 1800000,
    name_ru_plur: '30 минут'
  },
  '1H': {
    timeframe: '1H',
    name_ru: '1 час',
    lifetime: 3600000,
    name_ru_plur: '1 час'
  },
  '6H': {
    timeframe: '6H',
    lifetime: 21600000,
    name_ru_plur: '6 часов',
    name_ru: '6 часов'
  },
  '1D': {
    timeframe: '1D',
    name_ru: '1 день',
    lifetime: 86400000,
    name_ru_plur: '1 день'
  },
  '1W': {
    timeframe: '1W',
    name_ru: '1 неделя',
    lifetime: 604800000,
    name_ru_plur: '1 неделю'
  }
}

const SHIFT_SOURCES_CONFIG: Record<EMarketDataSources, ShiftTimeframeConfig> = {
  [EMarketDataSources.binance]: {
    minTimeframeTime: 10000
  },
  [EMarketDataSources.bybit]: {
    minTimeframeTime: 5000
  },
  [EMarketDataSources.coingecko]: {
    minTimeframeTime: 3600000
  },
  [EMarketDataSources.tinkoff]: {
    minTimeframeTime: 10000
  },
  [EMarketDataSources.yahoo]: {
    minTimeframeTime: 3600000
  }
}

export const SHIFT_TIMEFRAMES_ARRAY = Object.values(SHIFT_TIMEFRAMES)

/**
 * Config for timeframes by every source
 */
// @ts-expect-error FIXME
// eslint-disable-next-line max-len
export const SHIFT_TIMEFRAMES_BY_SOURCE_CONFIG: Record<EMarketDataSources, ShiftTimeframe[]> = Object.keys(EMarketDataSources).reduce<Record<EMarketDataSources, ShiftTimeframe[]>>((acc, source: EMarketDataSources) => {
  acc[source] = SHIFT_TIMEFRAMES_ARRAY.filter(el => el.lifetime >= SHIFT_SOURCES_CONFIG[source].minTimeframeTime)
  return acc
  // @ts-expect-error
}, {})
