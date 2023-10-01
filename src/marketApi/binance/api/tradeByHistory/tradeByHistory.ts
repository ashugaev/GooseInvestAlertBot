import { AggregatedTrade } from 'binance-api-node'

import { cryptoSignals } from '@/bots/cryptoSignals/configs/cryptoSignals'
import { log } from '@/helpers'
import { getTicks } from '@/marketApi/binance/api/getTicks'
import { SignalType } from '@/models/Signal'
const { format, differenceInDays } = require('date-fns')

interface GetTicksParams {
  /**
   * Врем выхода сигнала
   */
  signalMessageTime: number
  /**
   * Символ сигнала
   */
  signalMessageSymbol: string
  /**
   * Игнорировать TP, SL в сигнале и использовать свои
   */
  signalMessageTPValue: number[]
  signalMessageSLValue: number
  signalMessageTradeStartPrice?: number
  signalMessageDirection: SignalType

  manualInputTPPercent: number
  manualInputSLPercent: number

  /**
   * Переопределить указанную в сигнале цену входа
   */
  manualInputPercentOverrideSignalPrice: boolean
  /**
   * Обрабатывать только сигналы с указанным TP, SL
   */
  ignoreSignalsWithoutTPSL: boolean
  /**
   * Если нет данных то использовать процент указанный юзером
   */
  manualInputPercentAsFallbackForLackOfSignalTPSL: boolean
}

export interface GetTicksResult {
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
  signalMessageTradeStartPrice: number
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
   * First tick after trade started
   */
  tradeStartDatePrice: number
  /**
   * First tick after messagte came
   */
  firstAfterMessagePrice: number

  TPwasAutoCalculated: boolean
  SLwasAutoCalculated: boolean
}

/**
 * Торговля по истории из Binance
 */
export const tradeByHistory = async ({
  signalMessageTime,
  signalMessageTradeStartPrice,
  signalMessageTPValue,
  signalMessageSLValue,
  signalMessageSymbol,
  signalMessageDirection,

  manualInputTPPercent,
  manualInputSLPercent,

  manualInputPercentOverrideSignalPrice,
  ignoreSignalsWithoutTPSL,
  manualInputPercentAsFallbackForLackOfSignalTPSL,
}: GetTicksParams): Promise<GetTicksResult> => {
  const ticks: AggregatedTrade[] = []

  if (
    ignoreSignalsWithoutTPSL &&
    (!signalMessageTPValue || !signalMessageSLValue)
  ) {
    return null
  }

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
  let TPwasAutoCalculated = false
  let SLwasAutoCalculated = false

  // Trade trading start
  let tradeStartDate: Date = null
  let tradeStartDatePrice = null
  let firstAfterMessagePrice = null

  // Trade result
  let tradeTPTriggeredDate = null
  let tradeSLTriggeredDate = null

  // Trade input
  let tradeTPExpectingPrice = signalMessageTPValue[0]
  let tradeSLExpectingPrice = signalMessageSLValue

  let tradeStarted = false

  const isShort = signalMessageDirection === 'sell'
  const isLong = signalMessageDirection === 'buy'

  // Price wasn't sent in signal message
  if (!signalMessageTradeStartPrice && signalMessageTime) {
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
            startTime: signalMessageTime,
          }

      if (lastFetchedId?.length && lastFetchedId === params.fromId) {
        isNotEnougthDataForCheck = true
        break
      } else {
        lastFetchedId = params.fromId
      }

      if (ticks.length && !firstAfterMessagePrice) {
        firstAfterMessagePrice = Number(ticks[ticks.length - 1].price)
      }

      if (
        ticks.length &&
        differenceInDays(
          new Date(ticks[ticks.length - 1].timestamp),
          new Date(ticks[0].timestamp)
        ) > cryptoSignals.maxDaysForHistoricalTrade
      ) {
        isSkippedBecauseOfPeriod = true
        break
      }

      const newTicks = await getTicks({
        symbol: signalMessageSymbol,
        ...params,
      })
      ticks.push(...newTicks)

      // Collect first tick price for the case when we start instantly
      if (tradeStartDate && !tradeStartDatePrice) {
        tradeStartDatePrice = Number(ticks[0].price)
      }

      if (
        (!tradeTPExpectingPrice &&
          manualInputPercentAsFallbackForLackOfSignalTPSL) ||
        manualInputPercentOverrideSignalPrice
      ) {
        TPwasAutoCalculated = true
        tradeTPExpectingPrice =
          Number(tradeStartDatePrice) * (1 + manualInputTPPercent / 100)
      }
      if (
        (!tradeSLExpectingPrice &&
          manualInputPercentAsFallbackForLackOfSignalTPSL) ||
        manualInputPercentOverrideSignalPrice
      ) {
        SLwasAutoCalculated = true
        tradeSLExpectingPrice =
          Number(tradeStartDatePrice) * (1 - manualInputSLPercent / 100)
      }
    }

    // if still last
    if (ticks.length === i) {
      break
    }

    if (!tradeSLExpectingPrice || !tradeTPExpectingPrice) {
      return null
    }

    const tickPrice = Number(ticks[i].price)

    if (
      !tradeStarted &&
      // Wait price higher for buy
      ((tickPrice >= signalMessageTradeStartPrice && isLong) ||
        // Wait price lower for sale
        (tickPrice <= signalMessageTradeStartPrice && isShort))
    ) {
      tradeStarted = true
      tradeStartDate = new Date(ticks[i].timestamp)
      tradeStartDatePrice = tickPrice
    }

    if (!highestPrice || tickPrice > highestPrice) {
      highestPrice = tickPrice
    }

    if (!lowestPrice || tickPrice < lowestPrice) {
      lowestPrice = tickPrice
    }

    if (
      tradeStarted &&
      ((tickPrice >= tradeTPExpectingPrice && isLong) ||
        (tickPrice <= tradeTPExpectingPrice && isShort))
    ) {
      isTPTriggered = true
      tradeTPTriggeredDate = new Date(ticks[i].timestamp)
      isTradeSuccessfullyFinished = true
      break
    }

    if (
      tradeStarted &&
      ((tickPrice <= tradeSLExpectingPrice && isLong) ||
        (tickPrice >= tradeSLExpectingPrice && isShort))
    ) {
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
        Type: ${signalMessageDirection}
        Trade Started: ${tradeStarted}
        Trade Start Price: ${signalMessageTradeStartPrice}
        Initial price: ${tradeStartDatePrice}
        Target TP: ${tradeTPExpectingPrice}
        Target SL: ${tradeSLExpectingPrice}
        Current: ${tickPrice} 
        Highest: ${highestPrice} 
        Lowest: ${lowestPrice} 
        Last Tick Date: ${format(
          new Date(ticks[i].timestamp),
          'dd.MM.yyyy HH:mm:ss'
        )}`
      )
    }

    i++
  }

  return {
    ticks,
    isSLTriggered,
    isTPTriggered,
    signalMessageTradeStartPrice,
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
    TPwasAutoCalculated,
    SLwasAutoCalculated,
    firstAfterMessagePrice,
  }
}
