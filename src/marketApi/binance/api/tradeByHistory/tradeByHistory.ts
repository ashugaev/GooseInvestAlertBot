import { AggregatedTrade } from 'binance-api-node'

import { cryptoSignals } from '@/bots/cryptoSignals/configs/cryptoSignals'
import { calculateProfit } from '@/bots/cryptoSignals/utils/calculateProfit'
import { generateTradingViewTradeResults } from '@/bots/cryptoSignals/utils/generateTradingViewTradeResults'
import { getTradingViewChartLink } from '@/bots/cryptoSignals/utils/getTradingViewChartLink'
import { log } from '@/helpers'
import { addPercent } from '@/helpers/addPercent'
import { convertTimestampToLocalDate } from '@/helpers/time/convertTimestamp'
import { getTicks } from '@/marketApi/binance/api/getTicks'
import { SignalType } from '@/models/Signal'
const { format, differenceInDays } = require('date-fns')

export interface GetTicksParams {
  /**
   * Время выхода сигнала
   */
  signalMessageTime: number
  /**
   * Символ сигнала
   */
  signalMessageSymbol: string
  /**
   * Игнорировать TP, SL в сигнале и использовать свои
   */
  signalMessageTPValue: number[] | null
  signalMessageSLValue: number | null
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

  tradingViewChartlint: string
  tradingViewPineScrpt: string

  signalMessageDate: Date

  inputDataInvalid: boolean

  depositChangePercent?: number
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

  // No signals and forbidden fallback to percent or no data for fallback
  if (
    (!manualInputPercentAsFallbackForLackOfSignalTPSL ||
      !manualInputPercentAsFallbackForLackOfSignalTPSL) &&
    (!signalMessageTPValue || !signalMessageSLValue) &&
    !manualInputPercentOverrideSignalPrice
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
  let inputDataInvalid = false

  // Trade trading start
  let tradeStartDate: Date = null
  let tradeStartDatePrice = null
  let firstAfterMessagePrice = null

  // Trade result
  let tradeTPTriggeredDate = null
  let tradeSLTriggeredDate = null

  // Trade input
  let tradeTPExpectingPrice = signalMessageTPValue?.[0] || null
  let tradeSLExpectingPrice = signalMessageSLValue || null

  let tradeStarted = false

  const isShort = signalMessageDirection === 'sell'
  const isLong = signalMessageDirection === 'buy'

  const isTPValid =
    !signalMessageTradeStartPrice ||
    !tradeTPExpectingPrice ||
    (isShort
      ? tradeTPExpectingPrice < signalMessageTradeStartPrice
      : tradeTPExpectingPrice > signalMessageTradeStartPrice)

  const isSLValid =
    !signalMessageTradeStartPrice ||
    !tradeSLExpectingPrice ||
    (isShort
      ? tradeSLExpectingPrice > signalMessageTradeStartPrice
      : tradeSLExpectingPrice < signalMessageTradeStartPrice)

  // FIXME: Possibly works wrong
  if (!isTPValid || !isSLValid) {
    inputDataInvalid = true
    return null
  }
  // Price wasn't sent in signal message
  if (!signalMessageTradeStartPrice && signalMessageTime) {
    isStartPriceDetectedByDate = true
    tradeStarted = true
    tradeStartDate = convertTimestampToLocalDate(signalMessageTime)
  }

  let i = 0
  let lastFetchedId = null

  while (true) {
    let tickDate = convertTimestampToLocalDate(ticks[i]?.timestamp)

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
          convertTimestampToLocalDate(ticks[ticks.length - 1]?.timestamp),
          convertTimestampToLocalDate(ticks[0]?.timestamp)
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

      if (ticks.length && !firstAfterMessagePrice) {
        firstAfterMessagePrice = Number(ticks[0].price)
      }

      tickDate = convertTimestampToLocalDate(ticks[i]?.timestamp)

      // Collect first tick price for the case when we start instantly
      if (tradeStartDate && !tradeStartDatePrice) {
        tradeStartDatePrice = Number(ticks[0].price)
      }
    }

    // if still last
    if (ticks.length === i) {
      break
    }

    // if (!tradeSLExpectingPrice || !tradeTPExpectingPrice) {
    //   return null
    // }

    const tickPrice = Number(ticks[i].price)

    if (
      !tradeStarted &&
      // Wait price higher for buy
      ((tickPrice >= signalMessageTradeStartPrice && isLong) ||
        // Wait price lower for sale
        (tickPrice <= signalMessageTradeStartPrice && isShort))
    ) {
      tradeStarted = true
      tradeStartDate = tickDate
      tradeStartDatePrice = tickPrice
    }

    // Recalculate TP by percent
    if (
      !tradeTPExpectingPrice &&
      (manualInputPercentAsFallbackForLackOfSignalTPSL ||
        manualInputPercentOverrideSignalPrice) &&
      tradeStartDatePrice
    ) {
      TPwasAutoCalculated = true

      tradeTPExpectingPrice = addPercent(
        Number(tradeStartDatePrice),
        signalMessageDirection === 'buy'
          ? manualInputTPPercent
          : -manualInputTPPercent,
        4
      )
    }
    // Recalculate SL by percent
    if (
      !tradeSLExpectingPrice &&
      (manualInputPercentAsFallbackForLackOfSignalTPSL ||
        manualInputPercentOverrideSignalPrice) &&
      tradeStartDatePrice
    ) {
      SLwasAutoCalculated = true

      tradeSLExpectingPrice = addPercent(
        tradeStartDatePrice,
        signalMessageDirection === 'buy'
          ? -manualInputSLPercent
          : manualInputSLPercent,
        4
      )
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
      tradeTPTriggeredDate = tickDate
      isTradeSuccessfullyFinished = true
      break
    }

    if (
      tradeStarted &&
      ((tickPrice <= tradeSLExpectingPrice && isLong) ||
        (tickPrice >= tradeSLExpectingPrice && isShort))
    ) {
      isSLTriggered = true
      tradeSLTriggeredDate = tickDate
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
        Last Tick Date: ${format(tickDate, 'dd.MM.yyyy HH:mm:ss')}`
      )
    }

    i++
  }

  const signalMessageDate = convertTimestampToLocalDate(signalMessageTime)

  const tradingViewPineScrpt = generateTradingViewTradeResults({
    signalMessageDate,
    tradeStartDate,
    // @ts-ignore
    signalMessageSymbol,
    firstAfterMessagePrice,
    tradeStartDatePrice,
    tradeSLExpectingPrice,
    tradeTPExpectingPrice,
    isTPTriggered,
    isSLTriggered,
    tradeTPTriggeredDate,
    tradeSLTriggeredDate,
  })

  const tradingViewChartlint = getTradingViewChartLink({
    symbol: signalMessageSymbol + 'USDT',
    source: 'BINANCE',
  })

  const res: GetTicksResult = {
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
    tradingViewChartlint,
    tradingViewPineScrpt,
    signalMessageDate,
    inputDataInvalid,
  }

  const depositChangePercent = calculateProfit(res)

  res.depositChangePercent = depositChangePercent

  return res
}
