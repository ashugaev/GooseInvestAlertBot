import { SHUTDOWN_MESSAGE, shutdownMode } from '@/middlewares/shutdownMode'

const makeCtx = () =>
  ({
    reply: jest.fn().mockResolvedValue(undefined),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

describe('shutdownMode middleware', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('passes through when SHUTDOWN_MODE is not "true"', async () => {
    delete process.env.SHUTDOWN_MODE
    const ctx = makeCtx()
    const next = jest.fn()
    await shutdownMode(ctx, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(ctx.reply).not.toHaveBeenCalled()
  })

  it('replies with the shutdown message when SHUTDOWN_MODE=true', async () => {
    process.env.SHUTDOWN_MODE = 'true'
    const ctx = makeCtx()
    const next = jest.fn()
    await shutdownMode(ctx, next)
    expect(next).not.toHaveBeenCalled()
    expect(ctx.reply).toHaveBeenCalledWith(SHUTDOWN_MESSAGE)
  })
})
