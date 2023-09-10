import { AggregatedTrade } from 'binance-api-node'

import { binance } from '@/marketApi/binance/utils/binance'

export const getTicks = async ({ startTime, tp, sl, symbol }) => {
  const ticks: AggregatedTrade[] = []

  const getMoreTicks = async (startTime) => {
    const newTicks = await binance.aggTrades({ symbol, startTime, limit: 1000 })
    ticks.push(...newTicks)
    return newTicks
  }

  const i = 0

  while (true) {
    // if last
    if (i === ticks.length - 1) {
      await getMoreTicks(startTime)
    }

    if (ticks[i].price >= tp || ticks[i].price <= sl) {
      break
    }
  }

  return ticks
}
