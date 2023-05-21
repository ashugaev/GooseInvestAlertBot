/** Require SDK */
const API = require('kucoin-node-sdk')

/** Init Configure */
API.init({
  baseUrl: '',
  apiAuth: {
    key: '', // KC-API-KEY
    secret: '', // API-Secret
    passphrase: '', // KC-API-PASSPHRASE
  },
  authVersion: 2, // KC-API-KEY-VERSION. Notice: for v2 API-KEY, not required for v1 version.
})