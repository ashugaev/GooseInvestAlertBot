import {
  AlertFailureBucket,
  classifyAlertFailure,
  emptyBuckets,
  topTickersInBucket,
} from '@/cron/priceChecker/classifyAlertFailure'

describe('classifyAlertFailure', () => {
  it('returns null when instrument and price are good', () => {
    expect(
      classifyAlertFailure({ hasInstrument: true, lastPrice: 100 })
    ).toBeNull()
  })

  it('flags noInstrument when instrument is missing — even if price exists', () => {
    expect(classifyAlertFailure({ hasInstrument: false, lastPrice: 100 })).toBe(
      AlertFailureBucket.NoInstrument
    )
  })

  it('flags noPrice when price is undefined or null', () => {
    expect(
      classifyAlertFailure({ hasInstrument: true, lastPrice: undefined })
    ).toBe(AlertFailureBucket.NoPrice)
    expect(classifyAlertFailure({ hasInstrument: true, lastPrice: null })).toBe(
      AlertFailureBucket.NoPrice
    )
  })

  it('flags invalidPrice when price is non-positive or non-numeric', () => {
    expect(classifyAlertFailure({ hasInstrument: true, lastPrice: 0 })).toBe(
      AlertFailureBucket.InvalidPrice
    )
    expect(classifyAlertFailure({ hasInstrument: true, lastPrice: -1 })).toBe(
      AlertFailureBucket.InvalidPrice
    )
    expect(
      classifyAlertFailure({ hasInstrument: true, lastPrice: 'oops' })
    ).toBe(AlertFailureBucket.InvalidPrice)
  })
})

describe('emptyBuckets', () => {
  it('returns four independent empty arrays', () => {
    const a = emptyBuckets()
    const b = emptyBuckets()
    a[AlertFailureBucket.NoInstrument].push('x')
    expect(b[AlertFailureBucket.NoInstrument]).toEqual([])
    expect(Object.keys(a).sort()).toEqual([
      'error',
      'invalidPrice',
      'noInstrument',
      'noPrice',
    ])
  })
})

describe('topTickersInBucket', () => {
  it('counts entries by tickerId portion of "tickerId:userId"', () => {
    const top = topTickersInBucket(
      [
        'binance_BTCUSDT:1',
        'binance_BTCUSDT:2',
        'binance_BTCUSDT:3',
        'TCS00A1071D5:1',
        'TCS00A1071D5:2',
        'upeg_usdt:1',
      ],
      3
    )
    expect(top).toEqual([
      { tickerId: 'binance_BTCUSDT', count: 3 },
      { tickerId: 'TCS00A1071D5', count: 2 },
      { tickerId: 'upeg_usdt', count: 1 },
    ])
  })

  it('caps the result at the limit', () => {
    const entries = ['a:1', 'b:1', 'c:1', 'd:1']
    expect(topTickersInBucket(entries, 2)).toHaveLength(2)
  })

  it('returns empty array for empty bucket', () => {
    expect(topTickersInBucket([])).toEqual([])
  })
})
