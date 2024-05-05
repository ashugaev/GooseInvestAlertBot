import { COINBASE_URL, CONIBASE_HEADERS } from '@/paymentApi/coinbase/index'

const axios = require('axios')

interface CreateCoinbaseInvoiceParams {
  amount: number
  currency?: string
  customerId: string
  customerName: string
  paymentDescription: string
  paymentName?: string
}

export const createCoinbaseInvoice = async ({
  currency = 'usd',
  customerName,
  customerId,
  amount,
  paymentDescription,
  paymentName = 'Снятие ограничений с бота',
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
    url: `${COINBASE_URL}/charges`,
    headers: CONIBASE_HEADERS,
    data: requestData,
  }

  const res = await axios(config)

  return res.data.data
}
