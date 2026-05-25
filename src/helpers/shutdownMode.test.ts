import {
  DEFAULT_SHUTDOWN_MESSAGE,
  getShutdownMessage,
  isShutdownEnabled,
} from '@/helpers/shutdownMode'

describe('isShutdownEnabled', () => {
  it('returns false when SHUTDOWN_MODE is missing', () => {
    expect(isShutdownEnabled({})).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isShutdownEnabled({ SHUTDOWN_MODE: '' })).toBe(false)
  })

  it('returns false for "false" / "0" / "off"', () => {
    expect(isShutdownEnabled({ SHUTDOWN_MODE: 'false' })).toBe(false)
    expect(isShutdownEnabled({ SHUTDOWN_MODE: '0' })).toBe(false)
    expect(isShutdownEnabled({ SHUTDOWN_MODE: 'off' })).toBe(false)
  })

  it('returns true for accepted truthy spellings', () => {
    expect(isShutdownEnabled({ SHUTDOWN_MODE: 'true' })).toBe(true)
    expect(isShutdownEnabled({ SHUTDOWN_MODE: 'TRUE' })).toBe(true)
    expect(isShutdownEnabled({ SHUTDOWN_MODE: '1' })).toBe(true)
    expect(isShutdownEnabled({ SHUTDOWN_MODE: 'yes' })).toBe(true)
    expect(isShutdownEnabled({ SHUTDOWN_MODE: 'on' })).toBe(true)
    expect(isShutdownEnabled({ SHUTDOWN_MODE: '  true  ' })).toBe(true)
  })
})

describe('getShutdownMessage', () => {
  it('returns the bundled default when no override is set', () => {
    expect(getShutdownMessage({})).toBe(DEFAULT_SHUTDOWN_MESSAGE)
  })

  it('returns the bundled default for blank override', () => {
    expect(getShutdownMessage({ SHUTDOWN_MESSAGE: '   ' })).toBe(
      DEFAULT_SHUTDOWN_MESSAGE
    )
  })

  it('returns the override verbatim when provided', () => {
    expect(getShutdownMessage({ SHUTDOWN_MESSAGE: 'custom text' })).toBe(
      'custom text'
    )
  })
})
