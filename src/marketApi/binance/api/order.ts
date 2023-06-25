import {
  FuturesOrder,
  MarketNewFuturesOrder,
  NewFuturesOrder,
} from 'binance-api-node'

import { getLastPrice } from '@/helpers/getLastPrice'
import { binance } from '@/marketApi/binance/utils/binance'
import { EMarketDataSources } from '@/marketApi/types'
import { getOneInstrumentFromCache } from '@/models'

/**
 * Change leverage for sumbol
 */
export const updateLeverage = async (symbol, leverage) => {
  await binance.futuresLeverage({ leverage, symbol })
}

/**
 * @todo - принимать для тейкпрофитов массив и делить между ними количество
 */
export const newMarkenOrderFuturesBinance = async (
  params: Pick<MarketNewFuturesOrder, 'symbol' | 'quantity'>
): Promise<FuturesOrder[]> => {
  const { symbol, quantity } = params

  await updateLeverage(symbol, 20)

  const ristPercent = 0.5
  const profitPercent = 2

  const symbolInfo = await getOneInstrumentFromCache({
    ticker: symbol,
    source: EMarketDataSources.binanceFuture,
  })
  const currentPrice = getLastPrice(symbolInfo.id)

  // @ts-ignore
  const precision = symbolInfo.sourceSpecificData.pricePrecision

  const stopPrice = (currentPrice * (1 - ristPercent / 100)).toFixed(precision)
  const takeProfitPrice = (currentPrice * (1 + profitPercent / 100)).toFixed(
    precision
  )

  const batchOrders: NewFuturesOrder[] = [
    // Order
    {
      quantity,
      symbol,
      type: 'MARKET',
      side: 'BUY',
    },
    // Stop loss
    {
      quantity,
      symbol,
      type: 'STOP_MARKET',
      side: 'SELL',
      stopPrice, // цена по которой сработает ордер
    },
    // Take profit
    {
      quantity,
      price: takeProfitPrice, // цена по которой продадим фьючерс
      stopPrice: takeProfitPrice, // цена по которой сработает ордер
      symbol,
      type: 'TAKE_PROFIT',
      side: 'SELL',
    },
  ]

  // FIXME: Почему-то не работает
  // const resOrder = await binance.futuresBatchOrders({
  //   batchOrders,
  // })

  const resOrder = await binance.futuresOrder(batchOrders[0])
  const resSL = await binance.futuresOrder(batchOrders[1])
  const resTP = await binance.futuresOrder(batchOrders[2])

  return [resOrder, resSL, resTP]
}
