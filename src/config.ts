export const botConfig = {
  appFlags: {
    // Turned off for development for now
    priceAlertBots: !(process.env.NODE_ENV === 'development'),
    cryptoSignalBots: true,
  },
  featureFlags: {},
}

export const listConfig = {
  itemsPerPage: 7,
}
