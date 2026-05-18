import {
  BroadcastResult,
  executeBroadcast,
  formatBroadcastReport,
} from '@/commands/broadcast/broadcast.utils'

describe('executeBroadcast', () => {
  it('delivers to all users when sendFn succeeds', async () => {
    const sendFn = jest.fn().mockResolvedValue(undefined)
    const userIds = [100, 200, 300]

    const result = await executeBroadcast(userIds, sendFn, 0)

    expect(result).toEqual({
      delivered: 3,
      failed: 0,
      total: 3,
      errors: [],
    })
    expect(sendFn).toHaveBeenCalledTimes(3)
    expect(sendFn).toHaveBeenCalledWith(100)
    expect(sendFn).toHaveBeenCalledWith(200)
    expect(sendFn).toHaveBeenCalledWith(300)
  })

  it('handles empty user list', async () => {
    const sendFn = jest.fn()

    const result = await executeBroadcast([], sendFn, 0)

    expect(result).toEqual({
      delivered: 0,
      failed: 0,
      total: 0,
      errors: [],
    })
    expect(sendFn).not.toHaveBeenCalled()
  })

  it('continues after individual send failures', async () => {
    const sendFn = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(
        new Error('Forbidden: bot was blocked by the user')
      )
      .mockResolvedValueOnce(undefined)

    const result = await executeBroadcast([1, 2, 3], sendFn, 0)

    expect(result.delivered).toBe(2)
    expect(result.failed).toBe(1)
    expect(result.total).toBe(3)
    expect(result.errors).toEqual([
      { userId: 2, error: 'Forbidden: bot was blocked by the user' },
    ])
    // All three users were attempted
    expect(sendFn).toHaveBeenCalledTimes(3)
  })

  it('handles all failures', async () => {
    const sendFn = jest.fn().mockRejectedValue(new Error('network error'))

    const result = await executeBroadcast([10, 20], sendFn, 0)

    expect(result.delivered).toBe(0)
    expect(result.failed).toBe(2)
    expect(result.errors).toHaveLength(2)
  })

  it('handles non-Error throws', async () => {
    const sendFn = jest.fn().mockRejectedValue('string error')

    const result = await executeBroadcast([1], sendFn, 0)

    expect(result.errors[0].error).toBe('string error')
  })

  it('respects delay between sends', async () => {
    const sendFn = jest.fn().mockResolvedValue(undefined)
    const start = Date.now()

    await executeBroadcast([1, 2, 3], sendFn, 30)

    const elapsed = Date.now() - start
    // 2 pauses of 30ms each (no pause after last send)
    expect(elapsed).toBeGreaterThanOrEqual(50)
  })
})

describe('formatBroadcastReport', () => {
  it('formats a successful broadcast', () => {
    const result: BroadcastResult = {
      delivered: 100,
      failed: 0,
      total: 100,
      errors: [],
    }

    const report = formatBroadcastReport(result)

    expect(report).toContain('Total: 100')
    expect(report).toContain('Delivered: 100')
    expect(report).toContain('Failed: 0')
    expect(report).toContain('100.0%')
    expect(report).not.toContain('Failed users')
  })

  it('formats a partial delivery with errors', () => {
    const result: BroadcastResult = {
      delivered: 8,
      failed: 2,
      total: 10,
      errors: [
        { userId: 5, error: 'bot blocked' },
        { userId: 9, error: 'user deactivated' },
      ],
    }

    const report = formatBroadcastReport(result)

    expect(report).toContain('Delivered: 8')
    expect(report).toContain('Failed: 2')
    expect(report).toContain('80.0%')
    expect(report).toContain('Failed users')
    expect(report).toContain('5')
    expect(report).toContain('bot blocked')
  })

  it('truncates long error lists', () => {
    const errors = Array.from({ length: 25 }, (_, i) => ({
      userId: i + 1,
      error: 'blocked',
    }))
    const result: BroadcastResult = {
      delivered: 75,
      failed: 25,
      total: 100,
      errors,
    }

    const report = formatBroadcastReport(result)

    expect(report).toContain('and 5 more')
  })

  it('handles zero total users', () => {
    const result: BroadcastResult = {
      delivered: 0,
      failed: 0,
      total: 0,
      errors: [],
    }

    const report = formatBroadcastReport(result)

    expect(report).toContain('0.0%')
  })
})
