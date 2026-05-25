import { isShutdownMode } from '@/helpers/isShutdownMode'

describe('isShutdownMode', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns false when SHUTDOWN_MODE is unset', () => {
    delete process.env.SHUTDOWN_MODE
    expect(isShutdownMode()).toBe(false)
  })

  it('returns true only when SHUTDOWN_MODE is exactly "true"', () => {
    process.env.SHUTDOWN_MODE = 'true'
    expect(isShutdownMode()).toBe(true)
  })

  it('rejects other truthy spellings to keep the kill switch explicit', () => {
    for (const value of ['1', 'TRUE', 'yes', 'on', 'True']) {
      process.env.SHUTDOWN_MODE = value
      expect(isShutdownMode()).toBe(false)
    }
  })

  it('returns false for empty string', () => {
    process.env.SHUTDOWN_MODE = ''
    expect(isShutdownMode()).toBe(false)
  })
})
