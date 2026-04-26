import { fnTimeAsync } from '@/helpers/fnTime'
import { log } from '@/helpers/log'

describe('fnTimeAsync', () => {
  let infoSpy: jest.SpyInstance

  beforeEach(() => {
    infoSpy = jest.spyOn(log, 'info').mockImplementation(() => undefined)
  })

  afterEach(() => {
    infoSpy.mockRestore()
  })

  it('does not log when execution under threshold (1s)', async () => {
    await fnTimeAsync(async () => 42, 'fast op')
    expect(infoSpy).not.toHaveBeenCalled()
  })

  it('logs when execution exceeds threshold', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const promise = fnTimeAsync(async () => {
      jest.setSystemTime(new Date('2026-01-01T00:00:02Z'))
    }, 'slow op')
    await promise
    jest.useRealTimers()
    expect(infoSpy).toHaveBeenCalled()
    const args = infoSpy.mock.calls[0]
    expect(args[0]).toBe('slow op')
  })

  it('returns the wrapped function result', async () => {
    const res = await fnTimeAsync(async () => 'value', 'op')
    expect(res).toBe('value')
  })
})
