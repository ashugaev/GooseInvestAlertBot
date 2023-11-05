import { cryptoSignals } from '@/bots/cryptoSignals/configs/cryptoSignals'

interface TradeData {
  isSLTriggered: boolean
  isTPTriggered: boolean
  signalMessageTradeStartPrice: number
  tradeTPExpectingPrice: number
  tradeSLExpectingPrice: number
}

const RISK_PERCENTAGE = cryptoSignals.riskPercentForTradingSimulation

/**
 * Profit calc in percent, depending on rist percent
 */
export function calculateProfit(tradeData: TradeData): number {
  const potentialLostAmount = Math.abs(
    tradeData.tradeSLExpectingPrice - tradeData.signalMessageTradeStartPrice
  )

  const potentialProfitAmount = Math.abs(
    tradeData.tradeTPExpectingPrice - tradeData.signalMessageTradeStartPrice
  )

  if (tradeData.isTPTriggered) {
    return Number(
      (
        (potentialProfitAmount / potentialLostAmount) *
        RISK_PERCENTAGE *
        100
      ).toFixed(2)
    )
  } else if (tradeData.isSLTriggered) {
    return RISK_PERCENTAGE * 100 * -1
  } else {
    return 0
  }
}
