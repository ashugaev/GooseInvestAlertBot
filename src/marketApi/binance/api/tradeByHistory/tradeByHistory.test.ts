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

  it('SL Triggered', async () => {
    expect(true).toBe(true)
  })

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

  it('Trade with ignoreSignalsWithoutTPSL', async () => {
    expect(true).toBe(true)
  })

  it('Trade with manualInputPercentAsFallbackForLackOfSignalTPSL', async () => {
    expect(true).toBe(true)
  })
  it('Unfinished trade', async () => {
    expect(true).toBe(true)
  })

  it('Manual percent | Sell', async () => {
    const params: GetTicksParams = {
      ...baseParams,
      signalMessageTradeStartPrice: 5.519,
      signalMessageTPValue: [5.267],
      signalMessageSLValue: 5.64,
      signalMessageDirection: 'sell',
      manualInputTPPercent: 1,
      manualInputSLPercent: 1,
      manualInputPercentOverrideSignalPrice: true,
      signalMessageSymbol: 'FXS',
      signalMessageTime: 1697104403000,
    }

    const result = await tradeByHistory(params)

    expect(result.isTPTriggered).toBe(true)
    expect(result.tradeTPExpectingPrice).toBe(5.4628)
    expect(result.tradeSLExpectingPrice).toBe(5.5732)
    expect(result.TPwasAutoCalculated).toBe(true)
    expect(result.TPwasAutoCalculated).toBe(true)

    expect(result).toBeDefined()
  })

  it('Manual percent | Sell | 2', async () => {
    const signalMessageTime = new Date('10.14.2023 15:33:54').getTime()
    const params: GetTicksParams = {
      ...baseParams,
      signalMessageTradeStartPrice: 1.635,
      signalMessageTPValue: [1.542],
      signalMessageSLValue: 0.717,
      signalMessageDirection: 'sell',
      manualInputTPPercent: 1,
      manualInputSLPercent: 2,
      manualInputPercentOverrideSignalPrice: true,
      signalMessageSymbol: 'RUNE',
      signalMessageTime,
    }

    const result = await tradeByHistory(params)

    expect(result.isSLTriggered).toBe(true)
    expect(result.tradeTPExpectingPrice).toBe(1.6147)
    expect(result.tradeSLExpectingPrice).toBe(1.6636)
    expect(result.TPwasAutoCalculated).toBe(true)
    expect(result.TPwasAutoCalculated).toBe(true)

    expect(result).toBeDefined()
  })

  it('Manual percent | Sell | 3', async () => {
    const params: GetTicksParams = {
      ...baseParams,
      signalMessageTime: 1693575726000,
      signalMessageTradeStartPrice: 0.4815,
      signalMessageTPValue: [0],
      signalMessageSLValue: 0,
      signalMessageDirection: 'sell',
      manualInputTPPercent: 2,
      manualInputSLPercent: 1,
      manualInputPercentOverrideSignalPrice: true,
      signalMessageSymbol: 'STX',
    }

    const result = await tradeByHistory(params)

    expect(result.isSLTriggered).toBe(false)
    expect(result.isTPTriggered).toBe(true)
    expect(result.tradeTPExpectingPrice).toBe(0.4702)
    expect(result.tradeSLExpectingPrice).toBe(0.4846)
  })

  it('Invalid data', async () => {
    const params: GetTicksParams = {
      ...baseParams,
      signalMessageTradeStartPrice: 5.519,
      signalMessageTPValue: null,
      signalMessageSLValue: null,
      signalMessageDirection: 'sell',
      manualInputTPPercent: 1,
      manualInputSLPercent: 1,
    }

    const result = await tradeByHistory(params)

    expect(result).toBe(null)
  })

  it.skip('DEBUG Place', async () => {
    const params: GetTicksParams = {
      ...baseParams,
      signalMessageTradeStartPrice: 5.519,
      signalMessageTPValue: [5.267],
      signalMessageSLValue: 5.64,
      signalMessageDirection: 'sell',
      manualInputTPPercent: 1,
      manualInputSLPercent: 1,
      manualInputPercentOverrideSignalPrice: true,
    }

    const result = await tradeByHistory(params)
  })
})
