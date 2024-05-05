import axios from 'axios'

export const tronScanCheckTransaction = async (transactionId: string) => {
  const response = await axios(
    `https://apilist.tronscanapi.com/api/transaction-info?hash=${transactionId}`,
    {
      headers: {
        'TRON-PRO-API-KEY': process.env.TRONSCAN_API_KEY,
      },
    }
  )
  const data = await response.data
  return data
}
