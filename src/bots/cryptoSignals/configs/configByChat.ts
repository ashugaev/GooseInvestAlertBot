/**
 * Hardcode for by chats config
 *
 * TODO: Move to db
 */
export const configByChannelId: Record<string, ConfigForSignalChannel> = {
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
  // '-1001810513504': {
  //   name: 'Друг Артур',
  //   keyWords: ['СИГНАЛ'],
  //   manualInputPercentOverrideSignalPrice: false,
  //   ignoreSignalsWithoutTPSL: false,
  //   manualInputPercentAsFallbackForLackOfSignalTPSL: true,
  //   removeNotFinished: true,
  // },
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
}

export interface ConfigForSignalChannel {
  name?: string
  directionRequired?: boolean // AI
  tickerInBigLetters?: boolean // Manual
  tickerWithHash?: boolean // Manual
  priceRequired?: boolean // Manual / AI
  keyWords?: string[] // Manual
  or?: string[] // Manual

  manualInputPercentOverrideSignalPrice: boolean
  ignoreSignalsWithoutTPSL: boolean
  manualInputPercentAsFallbackForLackOfSignalTPSL: boolean
  removeNotFinished: boolean
}
