import { DetectorConfig } from '@/features/pumpDetect/pumpDetect.constants'

type ChannelsTrackingList =
  | 'Whales_Pumping_Cryptocurrency'
  | '-1001981898593'
  | 'DefiUniverse'
  | '-1001720000437'
  | '-1001922990972'
  | '-1001129197833'
  | '-1001810513504'
  | '-1001596060097'
  | '-1001980195660'
  | '-1001853603830'
  | '-1001782535846'
  | '-1001616064098'
  | '-1001558796279'
  | '-1001919602754'

// TRADE CONFIG
// @ts-ignore
export const tradeConfigByChannel: Record<
  ChannelsTrackingList,
  DetectorConfig
> = {
  Whales_Pumping_Cryptocurrency: {
    allowedUTCHours: null,
    mustBeRoundHour: true,
    debugMessagesTracker: false,
    buyAmount: 10,
  },
  '-1001981898593': {
    allowedUTCHours: null,
    mustBeRoundHour: false,
    debugMessagesTracker: true,
    buyAmount: 0.11,
  },
  DefiUniverse: {
    allowedUTCHours: null,
    mustBeRoundHour: false,
    debugMessagesTracker: false,
    buyAmount: 0.11,
  },
}

/**
 * Hardcode for by chats config
 *
 * TODO: Move to db
 * MONITOR CONFIG
 */
export const monitorConfigByChannelId: Record<
  ChannelsTrackingList,
  ConfigForSignalChannel
> = {
  '-1001720000437': {
    name: 'CRYPTONITE',
    // directionRequired: true,
    // tickerInBigLetters: true,
    // tickerWithHash: false,
    // priceRequired: false,
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: true,
    removeNotFinished: true,
  },
  '-1001922990972': {
    name: 'Tyler Davis | Crypto Path',
    keyWords: ['Торговая пара', 'Точка входа'],
    manualInputPercentOverrideSignalPrice: true,
    ignoreSignalsWithoutTPSL: true,
    manualInputPercentAsFallbackForLackOfSignalTPSL: false,
    removeNotFinished: true,
  },
  '-1001129197833': {
    name: 'Binance Trading (Free Signals)',
    keyWords: ['BUY', 'SELL', 'USE SL'],
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: true,
    removeNotFinished: true,
  },
  '-1001810513504': {
    disabled: true,
    name: 'Друг Артур',
    keyWords: ['СИГНАЛ'],
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: true,
    removeNotFinished: true,
  },
  '-1001596060097': {
    // Dead
    keyWords: ['Открываю'],
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: true,
    removeNotFinished: true,
  },
  '-1001980195660': {
    name: 'кодекс шнайдера',
    keyWords: ['Вход', 'Тейки', 'Стоп'],
    or: ['Long', 'Short'],
    manualInputPercentOverrideSignalPrice: true,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: true,
    removeNotFinished: true,
  },
  '-1001853603830': {
    name: 'Богдан Галицкий',
    keyWords: ['SHORT', 'LONG'],
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: true,
    removeNotFinished: true,
  },
  '-1001782535846': {
    name: 'Master Of Binance',
    futures: true,
    keyWords: [],
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: true,
    manualInputPercentAsFallbackForLackOfSignalTPSL: false,
    removeNotFinished: true,
  },
  '-1001616064098': {
    name: 'GG-Shot',
    keyWords: ['Short Entry', 'Long Entry'],
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: false,
    removeNotFinished: true,
  },
  '-1001558796279': {
    name: 'Сигнал Студио',
    keyWords: ['Short', 'Long', 'Вход'],
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: false,
    removeNotFinished: true,
  },
  '-1001919602754': {
    name: 'Гурам Premium',
    keyWords: ['SHORT', 'LONG'],
    manualInputPercentOverrideSignalPrice: true,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: false,
    removeNotFinished: true,
  },
  Whales_Pumping_Cryptocurrency: {
    disabled: true,
    keyWords: [],
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: false,
    removeNotFinished: true,
  },
  '-1001981898593': {
    name: 'test channel',
    disabled: true,
    keyWords: [],
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: false,
    removeNotFinished: true,
  },
  DefiUniverse: {
    disabled: true,
    keyWords: [],
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: false,
    removeNotFinished: true,
  },
}

export interface ConfigForSignalChannel {
  name?: string
  directionRequired?: boolean // AI
  tickerInBigLetters?: boolean // Manual
  tickerWithHash?: boolean // Manual
  priceRequired?: boolean // Manual / AI
  keyWords?: string[] // Manual
  or?: string[] // Manual
  disabled?: boolean // Manual

  futures?: boolean // Manual

  manualInputPercentOverrideSignalPrice: boolean
  ignoreSignalsWithoutTPSL: boolean
  manualInputPercentAsFallbackForLackOfSignalTPSL: boolean
  removeNotFinished: boolean
}
