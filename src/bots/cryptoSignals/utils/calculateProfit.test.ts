import { calculateProfit } from '@/bots/cryptoSignals/utils/calculateProfit'

describe('calculateProfit', () => {
  it('should return 0 if trade is not finished', () => {
    const res = calculateProfit({
      isSLTriggered: false,
      isTPTriggered: false,
      signalMessageTradeStartPrice: 0,
      tradeTPExpectingPrice: 0,
      tradeSLExpectingPrice: 0,
      isTradeSuccessfullyFinished: false,
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
      isTradeSuccessfullyFinished: true,
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
      isTradeSuccessfullyFinished: true,
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
      isTradeSuccessfullyFinished: true,
    })

    expect(res).toBe(2)
  })
})
