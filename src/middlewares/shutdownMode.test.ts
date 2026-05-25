import { DEFAULT_SHUTDOWN_MESSAGE } from '@/helpers/shutdownMode'
import { shutdownMode } from '@/middlewares/shutdownMode'

jest.mock('../helpers/log', () => ({
  log: { error: jest.fn(), info: jest.fn(), debug: jest.fn(), warn: jest.fn() },
}))

const makeCtx = (overrides: Record<string, unknown> = {}) =>
  ({
    chat: { id: 1, type: 'private' },
    updateType: 'message',
    reply: jest.fn().mockResolvedValue(undefined),
    answerCbQuery: jest.fn().mockResolvedValue(undefined),
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

describe('shutdownMode middleware', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
    delete process.env.SHUTDOWN_MODE
    delete process.env.SHUTDOWN_MESSAGE
  })

  it('passes through when SHUTDOWN_MODE is off', async () => {
    delete process.env.SHUTDOWN_MODE
    const ctx = makeCtx()
    const next = jest.fn()
    await shutdownMode(ctx, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(ctx.reply).not.toHaveBeenCalled()
  })

  it('intercepts and replies with default message when SHUTDOWN_MODE is on', async () => {
    process.env.SHUTDOWN_MODE = 'true'
    const ctx = makeCtx()
    const next = jest.fn()
    await shutdownMode(ctx, next)
    expect(next).not.toHaveBeenCalled()
    expect(ctx.reply).toHaveBeenCalledWith(
      DEFAULT_SHUTDOWN_MESSAGE,
      expect.objectContaining({ disable_web_page_preview: true })
    )
  })

  it('uses SHUTDOWN_MESSAGE override when provided', async () => {
    process.env.SHUTDOWN_MODE = '1'
    process.env.SHUTDOWN_MESSAGE = 'closing shop'
    const ctx = makeCtx()
    await shutdownMode(ctx, jest.fn())
    expect(ctx.reply).toHaveBeenCalledWith('closing shop', expect.any(Object))
  })

  it('acknowledges callback_query updates before replying', async () => {
    process.env.SHUTDOWN_MODE = 'true'
    const ctx = makeCtx({ updateType: 'callback_query' })
    await shutdownMode(ctx, jest.fn())
    expect(ctx.answerCbQuery).toHaveBeenCalled()
    expect(ctx.reply).toHaveBeenCalled()
  })

  it('does not reply (and does not crash) when ctx.chat is absent', async () => {
    process.env.SHUTDOWN_MODE = 'true'
    const ctx = makeCtx({ chat: undefined })
    const next = jest.fn()
    await shutdownMode(ctx, next)
    expect(next).not.toHaveBeenCalled()
    expect(ctx.reply).not.toHaveBeenCalled()
  })

  it('swallows reply errors so the bot does not crash on a bad update', async () => {
    process.env.SHUTDOWN_MODE = 'true'
    const ctx = makeCtx({
      reply: jest.fn().mockRejectedValue(new Error('boom')),
    })
    await expect(shutdownMode(ctx, jest.fn())).resolves.toBeUndefined()
  })
})
