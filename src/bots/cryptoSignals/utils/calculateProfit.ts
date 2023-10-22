import { cryptoSignals } from '@/bots/cryptoSignals/configs/cryptoSignals'

/**
 * Profit calc in percent, depending on rist percent
 */
export function calculateProfit(tradeData: TradeData): number {
  const RISK_PERCENTAGE = cryptoSignals.riskPercentForTradingSimulation

  const potentialLostAmount = Math.abs(
    tradeData.tradeSLExpectingPrice - tradeData.signalMessageTradeStartPrice
  )
  const potentialProfitAmount = Math.abs(
    tradeData.tradeTPExpectingPrice - tradeData.signalMessageTradeStartPrice
  )

  if (tradeData.isTPTriggered) {
    return (potentialProfitAmount / potentialLostAmount) * RISK_PERCENTAGE * 100
  } else if (tradeData.isSLTriggered) {
    return RISK_PERCENTAGE * 100 * -1
  } else {
    return 0
  }
}

interface TradeData {
  isSLTriggered: boolean
  isTPTriggered: boolean
  signalMessageTradeStartPrice: number
  tradeTPExpectingPrice: number
  tradeSLExpectingPrice: number
  isTradeSuccessfullyFinished: boolean
}
