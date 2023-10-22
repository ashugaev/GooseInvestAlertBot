import { calculateProfit } from '@/bots/cryptoSignals/utils/calculateProfit'

describe('calculateProfit', () => {
  it('should return 0 if trade is not finished', () => {
    const res = calculateProfit({
      isSLTriggered: false,
      isTPTriggered: false,
      signalMessageTradeStartPrice: 0,
      tradeTPExpectingPrice: 0,
      tradeSLExpectingPrice: 0,
    })

    expect(res).toBe(0)
  })

  it('should return 2% if trade is finished with SL', () => {
    const res = calculateProfit({
      isSLTriggered: true,
      isTPTriggered: false,
      signalMessageTradeStartPrice: 10,
      tradeTPExpectingPrice: 15,
      tradeSLExpectingPrice: 5,
    })

    expect(res).toBe(-2)
  })

  it('TP triggered | Different TP/SL', () => {
    const res = calculateProfit({
      isSLTriggered: false,
      isTPTriggered: true,
      signalMessageTradeStartPrice: 10,
      tradeTPExpectingPrice: 25,
      tradeSLExpectingPrice: 5,
    })

    expect(res).toBe(6)
  })

  it('TP Triggered | Same TP/SL', () => {
    const res = calculateProfit({
      isSLTriggered: false,
      isTPTriggered: true,
      signalMessageTradeStartPrice: 10,
      tradeTPExpectingPrice: 15,
      tradeSLExpectingPrice: 5,
    })

    expect(res).toBe(2)
  })

  it('TP Triggered | 3', () => {
    const res = calculateProfit({
      isSLTriggered: false,
      isTPTriggered: true,
      signalMessageTradeStartPrice: 0.517,
      tradeTPExpectingPrice: 0.5277, // 0.5277 - 0.517 = 0.0107
      tradeSLExpectingPrice: 0.5122, // 0.517 - 0.5122 = 0.0048
    })

    expect(res).toBe(4.46)
  })

  it('TP Triggered | 4', () => {
    const res = calculateProfit({
      isSLTriggered: false,
      isTPTriggered: true,
      signalMessageTradeStartPrice: 0.4815,
      tradeTPExpectingPrice: 0.4687, // 0.4815 - 0.4687 = 0.0128
      tradeSLExpectingPrice: 0.4831, // 0.4831 - 0.4815 = 0.0016
    })

    expect(res).toBe(16)
  })
})
