const axios = require('axios')

interface CreateCoinbaseInvoiceParams {
  amount: number
  currency?: string
  customerId: number
  customerName: string
  paymentDescription: string
  paymentName?: string
}

export const createCoinbaseInvoice = async ({
  currency = 'rub',
  customerName,
  customerId,
  amount,
  paymentDescription,
  paymentName = 'Безграничный доступ к функционалу бота @GooseInvestAlert',
}: CreateCoinbaseInvoiceParams) => {
  const requestData = JSON.stringify({
    local_price: {
      currency: currency,
      amount: amount,
    },
    metadata: {
      customer_id: customerId,
      customer_name: customerName,
    },
    pricing_type: 'fixed_price',
    name: paymentName,
    description: paymentDescription,
  })

  const config = {
    method: 'post',
    url: 'https://api.commerce.coinbase.com/charges',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CC-Api-Key': process.env.COINBASE_TOKEN,
      'X-CC-Version': '2018-03-22',
    },
    data: requestData,
  }

  const res = await axios(config)

  return res.data.data
}
