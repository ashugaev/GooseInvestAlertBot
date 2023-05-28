import { log } from '@/helpers'
import { wait } from '@/helpers/wait'
import { accountsList } from '@/marketApi/kucoin/accountsList'
import { tradeWithKucoin } from '@/marketApi/kucoin/trade'

const getAvailableAmount = async (ticker: string) => {
  const list = await accountsList()
  const account = list.data.find((acc) => acc.currency === ticker)

  return account.available
}

export const kucoinCellAll = async ({
  delay = 0,
  symbol,
  ticker,
  retries = 0,
  params,
}) => {
  let available = await getAvailableAmount(ticker)

  await wait(delay)

  for (let i = retries; i <= retries; i++) {
    try {
      const res = await tradeWithKucoin({
        size: available,
        symbol,
        side: 'sell',
        remark: 'Sell:' + params.message,
      })

      const orderId = res.data.orderId

      if (orderId) {
        break
      } else {
        throw new Error('Problems with sell order')
      }
    } catch (e) {
      log.error('kucoinCellAll', 'Error while selling', e)
      available = await getAvailableAmount(ticker)
    }
  }

  return available
}
