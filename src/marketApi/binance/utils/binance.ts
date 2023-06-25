import Binance from 'binance-api-node'

require('dotenv').config()

// Authenticated client, can make signed calls
export const binance = Binance({
  apiKey: process.env.BINANCE_APIKEY,
  apiSecret: process.env.BINANCE_APISECRET,
})
