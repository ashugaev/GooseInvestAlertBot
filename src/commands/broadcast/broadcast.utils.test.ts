import {
  BroadcastResult,
  buildConfirmKeyboard,
  executeBroadcast,
  formatBroadcastReport,
} from '@/commands/broadcast/broadcast.utils'

describe('executeBroadcast', () => {
  it('delivers to all users when sendFn succeeds', async () => {
    const sendFn = jest.fn().mockResolvedValue(undefined)
    const userIds = [100, 200, 300]

    const result = await executeBroadcast(userIds, sendFn, { delayMs: 0 })

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

    const result = await executeBroadcast([], sendFn, { delayMs: 0 })

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

    const result = await executeBroadcast([1, 2, 3], sendFn, { delayMs: 0 })

    expect(result.delivered).toBe(2)
    expect(result.failed).toBe(1)
    expect(result.total).toBe(3)
    expect(result.errors).toEqual([
      { userId: 2, error: 'Forbidden: bot was blocked by the user' },
    ])
    expect(sendFn).toHaveBeenCalledTimes(3)
  })

  it('handles all failures', async () => {
    const sendFn = jest.fn().mockRejectedValue(new Error('network error'))

    const result = await executeBroadcast([10, 20], sendFn, { delayMs: 0 })

    expect(result.delivered).toBe(0)
    expect(result.failed).toBe(2)
    expect(result.errors).toHaveLength(2)
  })

  it('handles non-Error throws', async () => {
    const sendFn = jest.fn().mockRejectedValue('string error')

    const result = await executeBroadcast([1], sendFn, { delayMs: 0 })

    expect(result.errors[0].error).toBe('string error')
  })

  it('respects delay between sends', async () => {
    const sendFn = jest.fn().mockResolvedValue(undefined)
    const start = Date.now()

    await executeBroadcast([1, 2, 3], sendFn, { delayMs: 30 })

    const elapsed = Date.now() - start
    // 2 pauses of 30ms each (no pause after last send)
    expect(elapsed).toBeGreaterThanOrEqual(50)
  })

  it('calls onProgress after each send attempt', async () => {
    const sendFn = jest.fn().mockResolvedValue(undefined)
    const onProgress = jest.fn()

    await executeBroadcast([10, 20, 30], sendFn, {
      delayMs: 0,
      onProgress,
    })

    expect(onProgress).toHaveBeenCalledTimes(3)
    expect(onProgress).toHaveBeenNthCalledWith(1, 1, 3)
    expect(onProgress).toHaveBeenNthCalledWith(2, 2, 3)
    expect(onProgress).toHaveBeenNthCalledWith(3, 3, 3)
  })

  it('calls onProgress even when sends fail', async () => {
    const sendFn = jest.fn().mockRejectedValue(new Error('fail'))
    const onProgress = jest.fn()

    await executeBroadcast([1, 2], sendFn, { delayMs: 0, onProgress })

    expect(onProgress).toHaveBeenCalledTimes(2)
  })

  it('does not abort broadcast when onProgress throws', async () => {
    const sendFn = jest.fn().mockResolvedValue(undefined)
    const onProgress = jest.fn().mockRejectedValue(new Error('progress boom'))

    const result = await executeBroadcast([1, 2, 3], sendFn, {
      delayMs: 0,
      onProgress,
    })

    expect(result.delivered).toBe(3)
    expect(result.failed).toBe(0)
  })

  it('uses default 50ms delay when no options provided', async () => {
    const sendFn = jest.fn().mockResolvedValue(undefined)
    const start = Date.now()

    await executeBroadcast([1, 2], sendFn)

    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(40)
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

  it('escapes HTML in error messages', () => {
    const result: BroadcastResult = {
      delivered: 0,
      failed: 1,
      total: 1,
      errors: [{ userId: 1, error: '<script>alert("xss")</script>' }],
    }

    const report = formatBroadcastReport(result)

    expect(report).not.toContain('<script>')
    expect(report).toContain('&lt;script&gt;')
  })
})

describe('buildConfirmKeyboard', () => {
  it('returns three rows of inline buttons', () => {
    const keyboard = buildConfirmKeyboard()

    expect(keyboard.inline_keyboard).toHaveLength(3)
    expect(keyboard.inline_keyboard[0][0].text).toBe('Send to all')
    expect(keyboard.inline_keyboard[1][0].text).toBe('Test (only me)')
    expect(keyboard.inline_keyboard[2][0].text).toBe('Cancel')
  })

  it('embeds valid action payloads', () => {
    const keyboard = buildConfirmKeyboard()
    const rows = keyboard.inline_keyboard

    expect(rows[0][0].callback_data).toContain('"m":"all"')
    expect(rows[1][0].callback_data).toContain('"m":"test"')
    expect(rows[2][0].callback_data).toContain('"m":"no"')
  })
})
