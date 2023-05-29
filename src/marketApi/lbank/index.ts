/*
REST API
https://www.lbkex.net/

https://api.lbkex.com/

https://api.lbank.info/

Websocket
wss://www.lbkex.net/ws/V2/
 */

import axios from 'axios'

export const LBANK_API_REST_URL = 'https://api.lbkex.com'

export const lbankRequest = async (path: string) => {
  return await axios(`${LBANK_API_REST_URL}${path}`, {
    headers: {
      contentType: 'application/x-www-form-urlencoded',
      timestamp: Date.now(),
      signature_method: 'RSA',
    },
  })
}
