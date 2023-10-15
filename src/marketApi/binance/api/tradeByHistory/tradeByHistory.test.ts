import {
  GetTicksParams,
  tradeByHistory,
} from '@/marketApi/binance/api/tradeByHistory/tradeByHistory'

describe('tradeByHistory', () => {
  const baseParams: GetTicksParams = {
    signalMessageTime: 1697290107000, // 13:28 UTC time
    signalMessageSymbol: 'MATIC',
    signalMessageTPValue: [0.5214],
    signalMessageSLValue: 0.4967,
    signalMessageTradeStartPrice: 0.517,
    signalMessageDirection: 'buy',
    manualInputTPPercent: 0.5,
    manualInputSLPercent: 0.15,
    manualInputPercentOverrideSignalPrice: false,
    ignoreSignalsWithoutTPSL: false,
    manualInputPercentAsFallbackForLackOfSignalTPSL: false,
  }

  it('TP triggered', async () => {
    const params: GetTicksParams = {
      ...baseParams,
    }

    const result = await tradeByHistory(params)

    expect(result.isTPTriggered).toBe(true)
    expect(result.isSLTriggered).toBe(false)
    expect(result.tradeTPTriggeredDate.toISOString()).toBe(
      '2023-10-14T15:58:25.792Z'
    )
    expect(result.tradeStartDate.toISOString()).toBe('2023-10-14T13:28:27.822Z')

    expect(result).toBeDefined()
  })

  it('SL Triggered', async () => {})

  it('Flag manualInputPercentOverrideSignalPrice', async () => {
    const params: GetTicksParams = {
      ...baseParams,
      manualInputPercentOverrideSignalPrice: true,
    }

    const result = await tradeByHistory(params)

    expect(result.isTPTriggered).toBe(true)
    expect(result.tradeTPTriggeredDate.toISOString()).toBe(
      '2023-10-14T15:38:47.666Z'
    )
    expect(result.tradeStartDate.toISOString()).toBe('2023-10-14T13:28:27.822Z')
    expect(result.isSLTriggered).toBe(false)
    // Check auto calculated TP and SL
    expect(result.tradeTPExpectingPrice).toBe(0.52)
    expect(result.tradeSLExpectingPrice).toBe(0.5166)

    expect(result).toBeDefined()
  })

  it('Trade with ignoreSignalsWithoutTPSL', async () => {})

  it('Trade with manualInputPercentAsFallbackForLackOfSignalTPSL', async () => {})
  it('Unfinished trade', async () => {})

  it('DEBUG Place', async () => {
    const params: GetTicksParams = {
      ...baseParams,
      signalMessageTradeStartPrice: 0.00664,
      signalMessageTPValue: [0.007105],
      signalMessageSLValue: 0.006435,
      signalMessageDirection: 'buy',
    }

    const result = await tradeByHistory(params)

    debugger
  })
})
