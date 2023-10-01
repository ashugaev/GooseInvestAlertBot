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
  },
  '-1001922990972': {
    name: 'CryptobatyaVIP',
    keyWords: ['Торговая пара', 'Точка входа'],
  },
  '-1001810513504': {
    name: 'Друг Артур',
    keyWords: ['СИГНАЛ'],
  },
  '-1001596060097': {
    // Dead
    keyWords: ['Открываю'],
  },
}

export interface ConfigForSignalChannel {
  name?: string
  directionRequired?: boolean // AI
  tickerInBigLetters?: boolean // Manual
  tickerWithHash?: boolean // Manual
  priceRequired?: boolean // Manual / AI
  keyWords?: string[] // Manual
}
