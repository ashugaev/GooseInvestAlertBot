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
  params: {
    tpPercentArr: number[]
    slPercent: number
    limitPriceLevel?: number
    type: 'LIMIT' | 'MARKET'
  } & Pick<MarketNewFuturesOrder, 'symbol' | 'quantity' | 'side'>
): Promise<FuturesOrder[]> => {
  const {
    symbol,
    quantity,
    tpPercentArr,
    slPercent,
    type,
    side,
    limitPriceLevel,
  } = params

  await updateLeverage(symbol, 5)

  const symbolInfo = await getOneInstrumentFromCache({
    ticker: symbol,
    source: EMarketDataSources.binanceFuture,
  })
  const price = limitPriceLevel ?? getLastPrice(symbolInfo.id)

  // @ts-ignore
  const precision = symbolInfo.sourceSpecificData.pricePrecision

  const stopPrice: string =
    side === 'BUY'
      ? (price * (1 - slPercent / 100)).toFixed(precision)
      : (price * (1 + slPercent / 100)).toFixed(precision)

  const takeProfitPrice: string =
    side === 'BUY'
      ? (price * (1 + tpPercentArr[0] / 100)).toFixed(precision)
      : (price * (1 - tpPercentArr[0] / 100)).toFixed(precision)

  const batchOrders: NewFuturesOrder[] = [
    // Order
    {
      quantity,
      symbol,
      type,
      side,
      // @ts-ignore
      price: type === 'LIMIT' ? price.toString() : undefined,
    },
    // Stop loss
    {
      quantity,
      symbol,
      type: 'STOP_MARKET',
      side: side === 'BUY' ? 'SELL' : 'BUY',
      stopPrice, // цена по которой сработает ордер
    },
    // Take profit
    {
      quantity,
      price: takeProfitPrice, // цена по которой продадим фьючерс
      stopPrice: takeProfitPrice, // цена по которой сработает ордер
      symbol,
      type: 'TAKE_PROFIT',
      side: side === 'BUY' ? 'SELL' : 'BUY',
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
