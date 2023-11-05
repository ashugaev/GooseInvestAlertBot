import { HistoryPriceAnalyze } from '@/bots/cryptoSignals/models/historyPriceAnalyze'
import {
  generatePineScriptCode,
  PointWithLabel,
} from '@/bots/cryptoSignals/utils/generagePinescript'

/**
 * Generates script for check trade on TradingView graphs
 */
export const generateTradingViewTradeResults = (
  tradeRes: Pick<
    HistoryPriceAnalyze,
    | 'signalMessageDate'
    | 'firstAfterMessagePrice'
    | 'tradeStartDate'
    | 'tradeStartDatePrice'
    | 'tradeSLExpectingPrice'
    | 'tradeTPExpectingPrice'
    | 'isTPTriggered'
    | 'isSLTriggered'
    | 'tradeTPTriggeredDate'
    | 'tradeSLTriggeredDate'
  >
): string => {
  const pineDots: PointWithLabel[] = [
    // Сообщение
    {
      timestamp: tradeRes.signalMessageDate.getTime(),
      label: 'Signal',
      labelColor: 'color.gray',
      type: 'dot',
      price: tradeRes.firstAfterMessagePrice,
    },
  ]

  // Точка входа
  if (tradeRes.tradeStartDate) {
    pineDots.push({
      timestamp: tradeRes.tradeStartDate.getTime(),
      price: tradeRes.tradeStartDatePrice,
      label: 'Start Trade',
      labelColor: 'color.blue',
      type: 'dot',
    })
  }

  if (tradeRes?.tradeSLExpectingPrice) {
    pineDots.push({
      price: tradeRes?.tradeSLExpectingPrice,
      label: 'SL Line',
      labelColor: 'color.red',
      type: 'line',
    })
  }

  if (tradeRes?.tradeTPExpectingPrice) {
    pineDots.push({
      price: tradeRes?.tradeTPExpectingPrice,
      label: 'TP Line',
      labelColor: 'color.green',
      type: 'line',
    })
  }

  if (tradeRes?.isTPTriggered) {
    pineDots.push(
      // TP
      {
        timestamp: new Date(tradeRes?.tradeTPTriggeredDate).getTime(),
        price: tradeRes?.tradeTPExpectingPrice,
        label: 'TP',
        labelColor: 'color.green',
        type: 'dot',
      }
    )
  }

  if (tradeRes?.isSLTriggered) {
    pineDots.push(
      // SL
      {
        timestamp: new Date(tradeRes?.tradeSLTriggeredDate).getTime(),
        price: tradeRes?.tradeSLExpectingPrice,
        label: 'SL',
        labelColor: 'color.red',
        type: 'dot',
      }
    )
  }

  const pineScriptString = generatePineScriptCode(pineDots)

  return pineScriptString
}
