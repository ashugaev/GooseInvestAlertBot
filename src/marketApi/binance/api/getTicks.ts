import { AggregatedTrade } from 'binance-api-node'

import { log } from '@/helpers'
import { binance } from '@/marketApi/binance/utils/binance'
const { format, differenceInDays } = require('date-fns')

interface GetTicksParams {
  /**
   * Врем выхода сигнала
   */
  signalMessageTime: number
  /**
   * Символ сигнала
   */
  symbol: string
  /**
   *
   */
  manualInputTPPercent: number
  manualInputSLPercent: number
  /**
   * Игнорировать TP, SL в сигнале и использовать свои
   */
  manualInputPercentOverrideSignalPrice: boolean
  /**
   * Обрабатыват только сигналы с указанным TP, SL
   */
  ignoreSignalsWithoutTPSL: boolean
  /**
   * Если нет данных то использовать процент указанный юзером
   */
  manualInputPercentAsFallbackForLackOfSignalTPSL: boolean
  tpValue: number[]
  slValue: number
  signalTradeStartPrice?: number
}

interface GetTicksResult {
  /**
   * All collected ticks
   */
  ticks: AggregatedTrade[]
  /**
   * Сделка закрыта по SL
   */
  isSLTriggered: boolean
  /**
   * Сделка закрыта по TP
   */
  isTPTriggered: boolean
  /**
   * Сделка закрыта по tp или sl
   * Т.е. проверка прошла корректно
   */
  isTradeSuccessfullyFinished: boolean
  /**
   * Время входа указанное в сигнале
   */
  signalTradeStartPrice: number
  tradeTPExpectingPrice: number
  tradeSLExpectingPrice: number
  isStartPriceDetectedByDate: boolean
  isNotEnougthDataForCheck: boolean

  tradeTPTriggeredDate: Date
  tradeSLTriggeredDate: Date
  isSkippedBecauseOfPeriod: boolean

  /**
   * Date when bot did enter the trade
   */
  tradeStartDate: Date
  /**
   * Price of ticker when signal came
   */
  tradeStartDatePrice: number
}

const maxDaysToCheck = 5

/**
 * @todo может быть кейс, когда signalMessageTime !== времени входа в сделку, по этому скрипт должен опреределять вход
 * @todo Check tradeTPExpectingPrice and tradeSLExpectingPrice
 * @todo Если есть startPrice то сначала ждем входа, потом уже проверяем tp и sl
 */
export const getTicks = async ({
  signalMessageTime,
  signalTradeStartPrice,
  manualInputTPPercent,
  manualInputSLPercent,
  tpValue,
  slValue,
  symbol,
}: GetTicksParams): Promise<GetTicksResult> => {
  const ticks: AggregatedTrade[] = []

  // Logs
  let highestPrice = null
  let lowestPrice = null

  // Flags
  let isTradeSuccessfullyFinished = false
  let isNotEnougthDataForCheck = false
  let isSkippedBecauseOfPeriod = false
  let isStartPriceDetectedByDate = false
  let isSLTriggered = false
  let isTPTriggered = false

  // Trade trading start
  let tradeStartDate: Date = null
  let tradeStartDatePrice = null

  // Trade result
  let tradeTPTriggeredDate = null
  let tradeSLTriggeredDate = null

  // Trade input
  let tradeTPExpectingPrice = tpValue[0]
  let tradeSLExpectingPrice = slValue

  const getMoreTicks = async ({
    signalMessageTime,
    fromId,
  }: {
    signalMessageTime?: number
    fromId?: string
  }) => {
    const params: {
      symbol: string
      fromId?: string
      signalMessageTime?: number
      endTime?: number
      limit?: number
    } = {
      symbol: symbol.toUpperCase() + 'USDT',
      limit: 1000,
    }

    if (signalMessageTime) {
      params.signalMessageTime = signalMessageTime
    }

    if (fromId) {
      params.fromId = fromId
    }

    const newTicks = await binance.aggTrades(params)
    ticks.push(...newTicks)
  }

  let tradeStarted = false

  // Price wasn't sent in signal message
  if (!signalTradeStartPrice && signalMessageTime) {
    isStartPriceDetectedByDate = true
    tradeStarted = true
    tradeStartDate = new Date(signalMessageTime)
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
            signalMessageTime,
          }

      if (lastFetchedId?.length && lastFetchedId === params.fromId) {
        isNotEnougthDataForCheck = true
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
        isSkippedBecauseOfPeriod = true
        break
      }

      await getMoreTicks(params)

      // Collect first tick price
      if (tradeStartDate && !tradeStartDatePrice) {
        tradeStartDatePrice = Number(ticks[0].price)
      }

      if (!signalTradeStartPrice) {
        signalTradeStartPrice = Number(ticks[0].price)
      }
      if (!tradeTPExpectingPrice) {
        tradeTPExpectingPrice =
          Number(signalTradeStartPrice) * (1 + manualInputTPPercent / 100)
      }
      if (!tradeSLExpectingPrice) {
        tradeSLExpectingPrice =
          Number(signalTradeStartPrice) * (1 - manualInputSLPercent / 100)
      }
    }

    // if still last
    if (ticks.length === i) {
      break
    }

    if (!tradeStarted && Number(ticks[i].price) === signalTradeStartPrice) {
      tradeStarted = true
      tradeStartDate = new Date(ticks[i].timestamp)
    }

    if (!highestPrice || Number(ticks[i].price) > highestPrice) {
      highestPrice = Number(ticks[i].price)
    }

    if (!lowestPrice || Number(ticks[i].price) < lowestPrice) {
      lowestPrice = Number(ticks[i].price)
    }

    if (tradeStarted && Number(ticks[i].price) >= tradeTPExpectingPrice) {
      isTPTriggered = true
      tradeTPTriggeredDate = new Date(ticks[i].timestamp)
      isTradeSuccessfullyFinished = true
      break
    }

    if (tradeStarted && Number(ticks[i].price) <= tradeSLExpectingPrice) {
      isSLTriggered = true
      tradeSLTriggeredDate = new Date(ticks[i].timestamp)
      isTradeSuccessfullyFinished = true
      break
    }

    // Show message every 1000 ticks
    if (i % 1000 === 0) {
      log.info(
        `
        Ticks: ${i} 
        Highest: ${highestPrice} 
        Target TP: ${tradeTPExpectingPrice}
        Target SL: ${tradeSLExpectingPrice}
        Lowest: ${lowestPrice} 
        Current: ${ticks[i].price} 
        Date: ${format(new Date(ticks[i].timestamp), 'dd.MM.yyyy HH:mm:ss')}`
      )
    }

    i++
  }

  return {
    ticks,
    isSLTriggered,
    isTPTriggered,
    signalTradeStartPrice,
    tradeTPExpectingPrice,
    tradeSLExpectingPrice,
    isTradeSuccessfullyFinished,
    isNotEnougthDataForCheck,
    isStartPriceDetectedByDate,
    tradeTPTriggeredDate,
    tradeSLTriggeredDate,
    isSkippedBecauseOfPeriod,
    tradeStartDate,
    tradeStartDatePrice,
  }
}
