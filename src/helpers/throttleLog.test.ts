import { createDedupByKey, createOncePerInterval } from '@/helpers/throttleLog'

describe('createOncePerInterval', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns true on first call', () => {
    const allow = createOncePerInterval(1000)
    expect(allow()).toBe(true)
  })

  it('returns false within interval', () => {
    const allow = createOncePerInterval(1000)
    allow()
    jest.advanceTimersByTime(500)
    expect(allow()).toBe(false)
  })

  it('returns true again after interval', () => {
    const allow = createOncePerInterval(1000)
    allow()
    jest.advanceTimersByTime(1000)
    expect(allow()).toBe(true)
  })

  it('keeps independent counters per key', () => {
    const allow = createOncePerInterval(1000)
    expect(allow('binance')).toBe(true)
    expect(allow('bybit')).toBe(true)
    expect(allow('binance')).toBe(false)
    jest.advanceTimersByTime(1000)
    expect(allow('binance')).toBe(true)
  })
})

describe('createDedupByKey', () => {
  it('returns true on first call', () => {
    const allow = createDedupByKey()
    expect(allow('a,b')).toBe(true)
  })

  it('returns false on identical key', () => {
    const allow = createDedupByKey()
    allow('a,b')
    expect(allow('a,b')).toBe(false)
  })

  it('returns true when key changes', () => {
    const allow = createDedupByKey()
    allow('a,b')
    expect(allow('a,b,c')).toBe(true)
  })

  it('treats reset to empty string as a new state', () => {
    const allow = createDedupByKey()
    allow('a')
    expect(allow('')).toBe(true)
    expect(allow('')).toBe(false)
    expect(allow('a')).toBe(true)
  })
})
