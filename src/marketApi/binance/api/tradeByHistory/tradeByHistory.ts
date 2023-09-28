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
  signalMessageDirection?: SignalType

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
   * Price of ticker when signal came
   */
  tradeStartDatePrice: number
}

/**
 * @todo может быть кейс, когда signalMessageTime !== времени входа в сделку, по этому скрипт должен опреределять вход
 * @todo Check tradeTPExpectingPrice and tradeSLExpectingPrice
 * @todo Если есть startPrice то сначала ждем входа, потом уже проверяем tp и sl
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
  let tradeTPExpectingPrice = signalMessageTPValue[0]
  let tradeSLExpectingPrice = signalMessageSLValue

  let tradeStarted = false

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

      // Collect first tick price
      if (tradeStartDate && !tradeStartDatePrice) {
        tradeStartDatePrice = Number(ticks[0].price)
      }

      if (!signalMessageTradeStartPrice) {
        signalMessageTradeStartPrice = Number(ticks[0].price)
      }
      if (!tradeTPExpectingPrice) {
        tradeTPExpectingPrice =
          Number(signalMessageTradeStartPrice) *
          (1 + manualInputTPPercent / 100)
      }
      if (!tradeSLExpectingPrice) {
        tradeSLExpectingPrice =
          Number(signalMessageTradeStartPrice) *
          (1 - manualInputSLPercent / 100)
      }
    }

    // if still last
    if (ticks.length === i) {
      break
    }

    if (
      !tradeStarted &&
      // Wait price higher for buy
      ((Number(ticks[i].price) >= signalMessageTradeStartPrice &&
        signalMessageDirection === 'buy') ||
        // Wait price lower for sale
        (Number(ticks[i].price) <= signalMessageTradeStartPrice &&
          signalMessageDirection === 'sell'))
    ) {
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
  }
}
