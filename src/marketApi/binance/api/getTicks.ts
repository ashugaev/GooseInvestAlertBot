import { AggregatedTrade } from 'binance-api-node'

import { log } from '@/helpers'
import { binance } from '@/marketApi/binance/utils/binance'
const { format, differenceInDays } = require('date-fns')

interface GetTicksParams {
  startTime: number
  symbol: string
  startPrice?: number
  tpPercentManual: number
  slPercentManual: number
  tpValue: number[]
  slValue: number
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
  startPriceDetectedByDate: boolean
  notEnougthDataForCheck: boolean
  startDate: Date
  tpDate: Date
  slDate: Date
  skippedBecauseOfPeriod: boolean
  priceForStartDate: number
}

const maxDaysToCheck = 5

/**
 * @todo может быть кейс, когда startTime !== времени входа в сделку, по этому скрипт должен опреределять вход
 * @todo Check tpPrice and slPrice
 * @todo Если есть startPrice то сначала ждем входа, потом уже проверяем tp и sl
 */
export const getTicks = async ({
  startTime,
  startPrice,
  tpPercentManual,
  slPercentManual,
  tpValue,
  slValue,
  symbol,
}: GetTicksParams): Promise<GetTicksResult> => {
  const ticks: AggregatedTrade[] = []
  let slTriggered = false
  let tpTriggered = false
  let tpPrice = tpValue[0]
  let tpDate = null
  let slPrice = slValue
  let slDate = null
  let highestPrice = null
  let lowestPrice = null
  let closed = false
  let notEnougthDataForCheck = false
  let skippedBecauseOfPeriod = false
  let startPriceDetectedByDate = false
  let startDate: Date = null
  let priceForStartDate = null

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

  let tradeStarted = false

  // Price wasn't sent in signal message
  if (!startPrice && startTime) {
    startPriceDetectedByDate = true
    tradeStarted = true
    startDate = new Date(startTime)
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

      if (
        ticks.length &&
        differenceInDays(
          new Date(ticks[ticks.length - 1].timestamp),
          new Date(ticks[0].timestamp)
        ) > maxDaysToCheck
      ) {
        skippedBecauseOfPeriod = true
        break
      }

      await getMoreTicks(params)

      // Collect first tick price
      if (startDate && !priceForStartDate) {
        priceForStartDate = Number(ticks[0].price)
      }

      if (!startPrice) {
        startPrice = Number(ticks[0].price)
      }
      if (!tpPrice) {
        tpPrice = Number(startPrice) * (1 + tpPercentManual / 100)
      }
      if (!slPrice) {
        slPrice = Number(startPrice) * (1 - slPercentManual / 100)
      }
    }

    // if still last
    if (ticks.length === i) {
      break
    }

    if (!tradeStarted && Number(ticks[i].price) === startPrice) {
      tradeStarted = true
      startDate = new Date(ticks[i].timestamp)
    }

    if (!highestPrice || Number(ticks[i].price) > highestPrice) {
      highestPrice = Number(ticks[i].price)
    }

    if (!lowestPrice || Number(ticks[i].price) < lowestPrice) {
      lowestPrice = Number(ticks[i].price)
    }

    if (tradeStarted && Number(ticks[i].price) >= tpPrice) {
      tpTriggered = true
      tpDate = new Date(ticks[i].timestamp)
      closed = true
      break
    }

    if (tradeStarted && Number(ticks[i].price) <= slPrice) {
      slTriggered = true
      slDate = new Date(ticks[i].timestamp)
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
    startPriceDetectedByDate,
    tpDate,
    slDate,
    skippedBecauseOfPeriod,
    startDate,
    priceForStartDate,
  }
}
