import { AggregatedTrade } from 'binance-api-node'

import { log } from '@/helpers'
import { binance } from '@/marketApi/binance/utils/binance'
const { format } = require('date-fns')

interface GetTicksParams {
  startTime: number
  tpPercent: number
  slPercent: number
  symbol: string
  startPrice?: number
}

interface GetTicksResult {
  ticks: AggregatedTrade[]
  slTriggered: boolean
  tpTriggered: boolean
  /**
   * Сделка закрыта по tp или sl
   */
  closed: boolean
  startPrice: number
  tpPrice: number
  slPrice: number
  priceDetectedByDate: boolean
  notEnougthDataForCheck: boolean
}

/**
 * @todo может быть кейс, когда startTime !== времени входа в сделку, по этому скрипт должен опреределять вход
 * @todo Check tpPrice and slPrice
 */
export const getTicks = async ({
  startTime,
  startPrice,
  tpPercent,
  slPercent,
  symbol,
}: GetTicksParams): Promise<GetTicksResult> => {
  const ticks: AggregatedTrade[] = []
  let slTriggered = false
  let tpTriggered = false
  let tpPrice = null
  let slPrice = null
  let highestPrice = null
  let lowestPrice = null
  let closed = false
  let notEnougthDataForCheck = false
  const priceDetectedByDate = false

  const getMoreTicks = async ({
    startTime,
    fromId,
  }: {
    startTime?: number
    fromId?: string
  }) => {
    const params: {
      symbol: string
      fromId?: string
      startTime?: number
      endTime?: number
      limit?: number
    } = {
      symbol: symbol.toUpperCase() + 'USDT',
      limit: 1000,
    }

    if (startTime) {
      params.startTime = startTime
    }

    if (fromId) {
      params.fromId = fromId
    }

    const newTicks = await binance.aggTrades(params)
    ticks.push(...newTicks)
  }

  // Price wasn't sent in signal message
  if (!startPrice && startTime) {
    priceDetectedByDate
  }

  let i = 0
  let lastFetchedId = null

  while (true) {
    // if last
    if (i === ticks.length) {
      const params = ticks.length
        ? {
            fromId: ticks[ticks.length - 1].aggId.toString(),
          }
        : {
            startTime,
          }

      if (lastFetchedId?.length && lastFetchedId === params.fromId) {
        notEnougthDataForCheck = true
        break
      } else {
        lastFetchedId = params.fromId
      }

      await getMoreTicks(params)

      if (!startPrice) {
        startPrice = Number(ticks[0].price)
      }
      if (!tpPrice) {
        // first tick price
        tpPrice = Number(ticks[0].price) * (1 + tpPercent / 100)
      }
      if (!slPrice) {
        // first tick price
        slPrice = Number(ticks[0].price) * (1 - slPercent / 100)
      }
    }

    // if still last
    if (ticks.length === i) {
      break
    }

    if (Number(ticks[i].price) > highestPrice) {
      highestPrice = Number(ticks[i].price)
    }

    if (Number(ticks[i].price) < lowestPrice) {
      lowestPrice = Number(ticks[i].price)
    }

    if (Number(ticks[i].price) >= tpPrice) {
      tpTriggered = true
      closed = true
      break
    }

    if (Number(ticks[i].price) <= slPrice) {
      slTriggered = true
      closed = true
      break
    }

    // Show message every 1000 ticks
    if (i % 1000 === 0) {
      log.info(
        `
        Ticks: ${i} 
        Highest: ${highestPrice} 
        Target TP: ${tpPrice}
        Target SL: ${slPrice}
        Lowest: ${lowestPrice} 
        Current: ${ticks[i].price} 
        Date: ${format(new Date(ticks[i].timestamp), 'dd.MM.yyyy HH:mm:ss')}`
      )
    }

    i++
  }

  return {
    ticks,
    slTriggered,
    tpTriggered,
    startPrice,
    tpPrice,
    slPrice,
    closed,
    notEnougthDataForCheck,
    priceDetectedByDate,
  }
}
