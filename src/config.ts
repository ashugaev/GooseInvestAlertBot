import { isDev } from '@/marketApi/kucoin'

export const botConfig = {
  appFlags: {
    priceAlertBots: !isDev,
    // priceAlertBots: true,
    cryptoSignalBots: true,
    trackSignals: true,
  },
  featureFlags: {},
}

export const listConfig = {
  itemsPerPage: 7,
}
