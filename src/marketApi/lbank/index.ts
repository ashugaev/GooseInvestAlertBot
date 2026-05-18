import axios from 'axios'

const LBANK_API_REST_URL = 'https://api.lbkex.com'

export const lbankRequest = async (path: string) => {
  return await axios(`${LBANK_API_REST_URL}${path}`, {
    headers: {
      contentType: 'application/x-www-form-urlencoded',
      timestamp: Date.now(),
      signature_method: 'RSA',
    },
  })
}
