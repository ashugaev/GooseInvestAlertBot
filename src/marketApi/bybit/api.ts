import { RestClientV5 } from 'bybit-api'

const API_KEY = process.env.BYBIT_API_KEY
const API_SECRET = process.env.BYBIT_API_SECRET
const useTestnet = false

export const byBitApi = new RestClientV5({
  key: API_KEY,
  secret: API_SECRET,
  testnet: useTestnet,
})
