import Binance from 'binance-api-node'

// Authenticated client, can make signed calls
export const binance = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_SECRET_KEY
})
