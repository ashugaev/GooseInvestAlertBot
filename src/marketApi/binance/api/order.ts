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

const getTPPrice = (price, tpPercent, side, precision) => {
  return side === 'BUY'
    ? (price * (1 + tpPercent / 100)).toFixed(precision)
    : (price * (1 - tpPercent / 100)).toFixed(precision)
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
    quantity: number
  } & Pick<MarketNewFuturesOrder, 'symbol' | 'side'>
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
  // @ts-ignore
  const quantityPrecision = symbolInfo.sourceSpecificData.quantityPrecision

  const stopPrice: string =
    side === 'BUY'
      ? (price * (1 - slPercent / 100)).toFixed(precision)
      : (price * (1 + slPercent / 100)).toFixed(precision)

  const batchOrders: NewFuturesOrder[] = [
    // Order
    // @ts-ignore
    {
      quantity: quantity.toString(),
      symbol,
      type,
      side,
      // @ts-ignore
      // return it for limit order only
      // price: type === 'LIMIT' ? price.toString() : undefined,
    },
    // Stop loss
    {
      quantity: quantity.toString(),
      symbol,
      type: 'STOP_MARKET',
      side: side === 'BUY' ? 'SELL' : 'BUY',
      stopPrice, // цена по которой сработает ордер
      closePosition: 'true',
    },
  ]

  const tpToHandle = tpPercentArr.slice(0, 2)
  const tpVolume = (quantity / tpToHandle.length).toFixed(quantityPrecision)

  // Take profit
  for (let i = 0; i < tpToHandle.length; i++) {
    batchOrders.push({
      quantity: tpVolume,
      price: getTPPrice(price, tpToHandle[i], side, precision), // цена по которой продадим фьючерс
      stopPrice: getTPPrice(price, tpToHandle[i], side, precision), // цена по которой сработает ордер
      symbol,
      type: 'TAKE_PROFIT',
      side: side === 'BUY' ? 'SELL' : 'BUY',
    })
  }

  // FIXME: Почему-то не работает
  // const resOrder = await binance.futuresBatchOrders({
  //   batchOrders,
  // })

  const resOrder = await binance.futuresOrder(batchOrders[0])
  const resSL = await binance.futuresOrder(batchOrders[1])
  const resTP = await binance.futuresOrder(batchOrders[2])
  if (batchOrders[3]) {
    await binance.futuresOrder(batchOrders[3])
  }

  return [resOrder, resSL, resTP]
}
