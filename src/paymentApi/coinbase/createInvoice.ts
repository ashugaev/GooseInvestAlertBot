const axios = require('axios')

export const createCoinbaseInvoice = async (ctx) => {
  const data = JSON.stringify({
    local_price: {
      currency: 'usd',
      amount: 10
    },
    metadata: {
      customer_id: '111111',
      customer_name: 'jjjjj'
    },
    pricing_type: 'fixed_price',
    name: 'GooseInvestAler Subcription',
    description: 'Helllloooll'
  })

  const config = {
    method: 'post',
    url: 'https://api.commerce.coinbase.com/charges',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CC-Api-Key': process.env.COINBASE_TOKEN,
      'X-CC-Version': '2018-03-22'
    },
    data: data
  }

  axios(config)
    .then((response) => {
      console.log(JSON.stringify(response.data))
    })
    .catch((error) => {
      console.log(error)
    })
}
