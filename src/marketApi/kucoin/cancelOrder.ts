import { log } from '@/helpers'
import { sayToBoss } from '@/helpers/sayToBoss'
import { KucoinAPI } from '@/marketApi/kucoin/index'

const logPrefix = '[KUCOIN CANCEL ORDER]'

export const kucoinCancelOrderWithRetry = async (symbol, retries = 0) => {
  if (retries > 5) {
    return
  }

  for (let i = 0; i < 5; i++) {
    try {
      const res = await KucoinAPI.rest.Trade.Orders.cancelAllOrders({
        symbol,
      })
      log.info(logPrefix, 'Order is canceled', res)
      sayToBoss({ message: `Order is canceled ${symbol}` })
      break
    } catch (e) {
      log.error(logPrefix, e)
    }
  }
}
