export const KucoinAPI = require('kucoin-node-sdk')

const { NODE_ENV, KUCOIN_API_KEY, KUCOIN_API_PASSPHRASE, KUCOIN_API_SECRET } = process.env

const isDev = NODE_ENV === 'development'

/** Init Configure */
KucoinAPI.init({
  // baseUrl: isDev ? 'https://openapi-sandbox.kucoin.com' : 'https://api.kucoin.com',
  baseUrl: 'https://api.kucoin.com',
  apiAuth: {
    key: KUCOIN_API_KEY,
    secret: KUCOIN_API_SECRET,
    passphrase: KUCOIN_API_PASSPHRASE,
  },
  authVersion: 2, // KC-API-KEY-VERSION. Notice: for v2 API-KEY, not required for v1 version.
})
