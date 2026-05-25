jest.mock('@/models', () => ({
  priceAlertCache: { removeItemFromCache: jest.fn() },
  removePriceAlert: jest.fn(),
}))
jest.mock('@/helpers/bot', () => ({ getBot: jest.fn() }))
jest.mock('@/helpers', () => ({ log: { error: jest.fn(), info: jest.fn() } }))
jest.mock('@/commands/alert/keyboards/triggeredAlert', () => ({
  triggeredAlertKeyboad: jest.fn(),
}))
jest.mock('@/commands/alert/messages/alert', () => ({
  alertMessage: jest.fn(),
}))

import { getBot } from '@/helpers/bot'
import { priceAlertCache, removePriceAlert } from '@/models'

import { sendTriggeredAlert } from './priceChecker.utils'

const fakeAlert = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id: { toString: () => 'alert-1' } as any,
  user: 42,
  chat: null,
  botId: 1,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

const fakeInstrument = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

describe('sendTriggeredAlert with SHUTDOWN_MODE', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('skips entirely when SHUTDOWN_MODE=true', async () => {
    process.env.SHUTDOWN_MODE = 'true'

    await sendTriggeredAlert(fakeAlert, fakeInstrument)

    expect(priceAlertCache.removeItemFromCache).not.toHaveBeenCalled()
    expect(getBot).not.toHaveBeenCalled()
    expect(removePriceAlert).not.toHaveBeenCalled()
  })

  it('proceeds when SHUTDOWN_MODE is unset', async () => {
    delete process.env.SHUTDOWN_MODE
    // getBot resolves to null so we exit before attempting to send,
    // but after we have proven the cache invalidation ran.
    ;(getBot as jest.Mock).mockResolvedValue(null)

    await sendTriggeredAlert(fakeAlert, fakeInstrument)

    expect(priceAlertCache.removeItemFromCache).toHaveBeenCalledWith('alert-1')
    expect(getBot).toHaveBeenCalledWith(1)
  })
})
