import { log } from '@/helpers'
import { wait } from '@/helpers/wait'
import { accountsList } from '@/marketApi/kucoin/accountsList'
import { tradeWithKucoin } from '@/marketApi/kucoin/trade'

const getAvailableAmount = async (
  ticker: string
): Promise<{ ticker: number; main: number }> => {
  const list = await accountsList()
  const accountTicker = list.data.find((acc) => acc.currency === ticker)
  const accountMain = list.data.find((acc) => acc.currency === 'USDT')

  return {
    ticker: Number(accountTicker.available),
    main: Number(accountMain.available),
  }
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
      if (available.ticker === 0) {
        break
      }

      await tradeWithKucoin({
        size: available.ticker,
        symbol,
        side: 'sell',
        remark: 'Sell:' + params.message,
      })
    } catch (e) {
      log.error('kucoinCellAll', 'Error while selling', e)
    } finally {
      const availableNew = await getAvailableAmount(ticker)
      if (availableNew.ticker > 0) {
        available = availableNew
      } else {
        // eslint-disable-next-line no-unsafe-finally
        break
      }
    }
  }

  return available
}
