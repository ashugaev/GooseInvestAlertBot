jest.mock('@/helpers/log', () => ({
  log: { error: jest.fn(), info: jest.fn() },
}))

import { log } from '@/helpers/log'
import { SHUTDOWN_MESSAGE, shutdownMode } from '@/middlewares/shutdownMode'

type Ctx = {
  chat?: { id: number }
  reply: jest.Mock
}

const makeCtx = (overrides: Partial<Ctx> = {}): Ctx => ({
  chat: { id: 1 },
  reply: jest.fn().mockResolvedValue(undefined),
  ...overrides,
})

describe('shutdownMode middleware', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('passes through when SHUTDOWN_MODE is not "true"', async () => {
    delete process.env.SHUTDOWN_MODE
    const ctx = makeCtx()
    const next = jest.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await shutdownMode(ctx as any, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(ctx.reply).not.toHaveBeenCalled()
  })

  it('replies with the shutdown message when SHUTDOWN_MODE=true', async () => {
    process.env.SHUTDOWN_MODE = 'true'
    const ctx = makeCtx()
    const next = jest.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await shutdownMode(ctx as any, next)
    expect(next).not.toHaveBeenCalled()
    expect(ctx.reply).toHaveBeenCalledWith(SHUTDOWN_MESSAGE)
  })

  // The Telegraf 3.x polling loop kills itself permanently on any middleware
  // throw (telegraf.js fetchUpdates -> handleUpdates rejection sets
  // polling.started = false). The two cases below pin the two ways this
  // middleware used to leak a rejection.
  it('skips chatless updates instead of throwing on ctx.reply', async () => {
    process.env.SHUTDOWN_MODE = 'true'
    const ctx = makeCtx({ chat: undefined })
    const next = jest.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(shutdownMode(ctx as any, next)).resolves.toBeUndefined()
    expect(next).not.toHaveBeenCalled()
    expect(ctx.reply).not.toHaveBeenCalled()
  })

  it('swallows reply failures (e.g. user blocked the bot)', async () => {
    process.env.SHUTDOWN_MODE = 'true'
    const ctx = makeCtx({
      reply: jest.fn().mockRejectedValue(new Error('Forbidden: bot blocked')),
    })
    const next = jest.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(shutdownMode(ctx as any, next)).resolves.toBeUndefined()
    expect(ctx.reply).toHaveBeenCalledWith(SHUTDOWN_MESSAGE)
    expect(log.error).toHaveBeenCalled()
  })
})
