import { populateInstrumentsCaches } from '@/models/instrumentsCacheLayout'

const makeCache = () => {
  const calls: { key: string; val: unknown }[][] = []
  return {
    calls,
    mset: (data: { key: string; val: unknown }[]) => {
      calls.push(data)
      return true
    },
  }
}

describe('populateInstrumentsCaches', () => {
  it('writes id-keyed entries for each item', () => {
    const byId = makeCache()
    const byTicker = makeCache()
    populateInstrumentsCaches(
      [
        { id: 'binance_BTCUSDT', ticker: 'BTCUSDT' },
        { id: 'TCS00A1002V2', ticker: 'TMOS' },
      ],
      byId,
      byTicker
    )
    const keys = byId.calls[0].map((e) => e.key).sort()
    expect(keys).toEqual(['TCS00A1002V2', 'binance_BTCUSDT'])
  })

  it('groups by-ticker entries (multiple instruments per ticker allowed)', () => {
    const byId = makeCache()
    const byTicker = makeCache()
    populateInstrumentsCaches(
      [
        { id: 'binance_BTCUSDT', ticker: 'BTCUSDT' },
        { id: 'bybit_BTCUSDT', ticker: 'BTCUSDT' },
        { id: 'TCS00A1002V2', ticker: 'TMOS' },
      ],
      byId,
      byTicker
    )
    const tickerEntry = byTicker.calls[0]
    const btc = tickerEntry.find((e) => e.key === 'BTCUSDT')!
    expect((btc.val as unknown[]).length).toBe(2)
    const tmos = tickerEntry.find((e) => e.key === 'TMOS')!
    expect((tmos.val as unknown[]).length).toBe(1)
  })

  it('skips items with empty/missing id (would otherwise throw in NodeCache.mset)', () => {
    const byId = makeCache()
    const byTicker = makeCache()
    populateInstrumentsCaches(
      [
        { id: '', ticker: 'X' },
        { id: undefined as unknown as string, ticker: 'Y' },
        { id: 'good', ticker: 'GOOD' },
      ],
      byId,
      byTicker
    )
    const ids = byId.calls[0].map((e) => e.key)
    expect(ids).toEqual(['good'])
  })

  it('skips ticker grouping for items without ticker (model allows it)', () => {
    const byId = makeCache()
    const byTicker = makeCache()
    populateInstrumentsCaches(
      [
        { id: 'a', ticker: undefined as unknown as string },
        { id: 'b', ticker: 'B' },
      ],
      byId,
      byTicker
    )
    expect(byId.calls[0].map((e) => e.key).sort()).toEqual(['a', 'b'])
    expect(byTicker.calls[0].map((e) => e.key)).toEqual(['B'])
  })

  it('handles empty input without throwing', () => {
    const byId = makeCache()
    const byTicker = makeCache()
    expect(() =>
      populateInstrumentsCaches([], byId, byTicker)
    ).not.toThrow()
    expect(byId.calls[0]).toEqual([])
    expect(byTicker.calls[0]).toEqual([])
  })
})
