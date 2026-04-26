import { isPaymentDateWithinOneDay } from '@/cron/subscriptionPayment/subscriptionPayment'

describe('isPaymentDateWithinOneDay', () => {
  it('accepts the same instant', () => {
    const d = new Date('2026-04-15T12:00:00Z')
    expect(isPaymentDateWithinOneDay(d, d.getTime())).toBe(true)
  })

  it('accepts up to 24h apart', () => {
    const issue = new Date('2026-04-15T12:00:00Z')
    const txTs = new Date('2026-04-16T12:00:00Z').getTime()
    expect(isPaymentDateWithinOneDay(issue, txTs)).toBe(true)
  })

  it('rejects more than 24h apart', () => {
    const issue = new Date('2026-04-15T12:00:00Z')
    const txTs = new Date('2026-04-17T00:00:00Z').getTime()
    expect(isPaymentDateWithinOneDay(issue, txTs)).toBe(false)
  })

  it('regression: works across month boundary (was broken with getDate())', () => {
    // Feb 1 -> Jan 31 (12 hours apart) — the old implementation computed
    // |1 - 31| = 30 and rejected the valid payment.
    const issue = new Date('2026-02-01T00:00:00Z')
    const txTs = new Date('2026-01-31T12:00:00Z').getTime()
    expect(isPaymentDateWithinOneDay(issue, txTs)).toBe(true)
  })

  it('handles negative diff (transaction earlier than issue) symmetrically', () => {
    const issue = new Date('2026-04-15T12:00:00Z')
    const txTs = new Date('2026-04-14T12:00:00Z').getTime()
    expect(isPaymentDateWithinOneDay(issue, txTs)).toBe(true)
  })
})
