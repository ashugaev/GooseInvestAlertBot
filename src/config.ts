export const botConfig = {
  appFlags: {
    // Turned off for development for now
    // priceAlertBots: !(process.env.NODE_ENV === 'development'),
    priceAlertBots: true,
    cryptoSignalBots: false,
    trackSignals: false,
  },
  featureFlags: {},
}

export const listConfig = {
  itemsPerPage: 7,
}
