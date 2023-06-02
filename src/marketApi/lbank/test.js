const axios = require('axios')

const LBANK_API_REST_URL = 'https://api.lbkex.com'
const crypto = require('crypto')

require('dotenv').config({ path: '../../../.env' })

const date = Date.now()

function getPrivateKey(key) {
  const keyBuffer = Buffer.from(key, 'base64')
  const privateKey = crypto.createPrivateKey({
    key: keyBuffer,
    format: 'der',
    type: 'pkcs8',
  })
  return privateKey
}

function signWithRSA(data, secretKey) {
  const priKey = getPrivateKey(secretKey)
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(data)
  const signed = sign.sign(priKey, 'base64')
  return signed
}

function generateLBankSignature(secretKey, parameters) {
  // Сортируем параметры по имени в алфавитном порядке
  const sortedParams = Object.keys(parameters)
    .sort()
    .reduce((obj, key) => {
      obj[key] = parameters[key]
      return obj
    }, {})

  // Создаем строку параметров
  const paramString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  // Добавляем параметры signature_method, timestamp и echostr
  // const paramsToSign = `${paramString}&signature_method=RSA&timestamp=${Date.now()}&echostr=your_echostr`

  // Генерируем MD5 хэш
  const md5Hash = crypto
    .createHash('md5')
    .update(paramString)
    .digest('hex')
    .toUpperCase()

  // Подписываем с помощью RSA или HmacSHA256
  const signature = signWithRSA(md5Hash, secretKey) // Замените функцию signWithRSA на соответствующую реализацию RSA подписи

  return signature
}

// Example usage
const apiKey = process.env.LBANK_API_KEY
const secretKey = process.env.LBANK_API_SECRET

const requestParams = {
  timestamp: date,
  signature_method: 'RSA',
  // Other request parameters
  api_key: apiKey,
  symbol: 'eth_btc',
  // type: 'sell_market',
  type: 'buy_market',
  // Сумма больше btc/1000
  amount: 100,
  echostr: 'P3LHfw6tUIYWc8R2VQNy0ilKmdg5pjhbxC7',
}

const sign = generateLBankSignature(secretKey, requestParams)

const lbankRequest = async (method, path, params = {}) => {
  return await axios(`${LBANK_API_REST_URL}${path}`, {
    method,
    headers: {
      contentType: 'application/x-www-form-urlencoded',
      timestamp: date,
      signature_method: 'RSA',
    },
    params,
  })
}

lbankRequest('POST', '/v2/supplement/create_order.do', {
  // lbankRequest('POST', '/v2/create_order.do', {
  // lbankRequest('POST', '/v2/supplement/create_order_test.do', {
  ...requestParams,
  sign,
})
  .then((data) => {
    const code = data.data.error_code
    debugger
  })
  .catch((error) => {
    debugger
  })
