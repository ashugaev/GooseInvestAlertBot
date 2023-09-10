import { AggregatedTrade } from 'binance-api-node'

import { binance } from '@/marketApi/binance/utils/binance'

interface GetTicksParams {
  startTime: number
  tpPercent: number
  slPercent: number
  symbol: string
}

interface GetTicksResult {
  ticks: AggregatedTrade[]
  slTriggered: boolean
  tpTriggered: boolean
  /**
   * Сделка закрыта по tp или sl
   */
  closed: boolean
}

/**
 * @todo может быть кейс, когда startTime !== времени входа в сделку, по этому скрипт должен опреределять вход
 * @todo Check tpPrice and slPrice
 */
export const getTicks = async ({
  startTime,
  tpPercent,
  slPercent,
  symbol,
}: GetTicksParams): Promise<GetTicksResult> => {
  const ticks: AggregatedTrade[] = []
  let slTriggered = false
  let tpTriggered = false
  let tpPrice = null
  let slPrice = null
  let closed = false

  const getMoreTicks = async (startTime) => {
    const newTicks = await binance.aggTrades({
      symbol: symbol.toUpperCase() + 'USDT',
      startTime,
      limit: 1000,
    })
    ticks.push(...newTicks)
    // return newTicks
  }

  let i = 0

  while (true) {
    // if last
    if (i === ticks.length) {
      await getMoreTicks(startTime)

      if (!tpPrice) {
        // first tick price
        tpPrice = Number(ticks[0].price) * (1 + tpPercent / 100)
        closed = true
      }
      if (!slPrice) {
        // first tick price
        slPrice = Number(ticks[0].price) * (1 - slPercent / 100)
        closed = true
      }
    }

    // if still last
    if (ticks.length === i) {
      break
    }

    if (Number(ticks[i].price) >= tpPrice) {
      tpTriggered = true
      break
    }

    if (Number(ticks[i].price) <= slPrice) {
      slTriggered = true
      break
    }

    i++
  }

  return {
    ticks,
    slTriggered,
    tpTriggered,
    closed,
  }
}
