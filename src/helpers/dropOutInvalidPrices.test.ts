import { dropOutInvalidPrices } from '@/helpers/dropOutInvalidPrices'
import { log } from '@/helpers/log'

describe('dropOutInvalidPrices', () => {
  let errorSpy: jest.SpyInstance

  beforeEach(() => {
    errorSpy = jest.spyOn(log, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('keeps only positive numeric prices', () => {
    const res = dropOutInvalidPrices([
      ['BTCUSDT', 100, 'binance_BTCUSDT'],
      ['ETHUSDT', 0, 'binance_ETHUSDT'],
      ['XRPUSDT', -1, 'binance_XRPUSDT'],
      ['SOLUSDT', 'oops' as unknown as number, 'binance_SOLUSDT'],
    ] as never)
    expect(res).toEqual([['BTCUSDT', 100, 'binance_BTCUSDT']])
  })

  it('does not log when nothing was dropped', () => {
    dropOutInvalidPrices([['BTCUSDT', 1, 'id']] as never)
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('logs aggregated counts when prices are partially invalid', () => {
    dropOutInvalidPrices([
      ['BTCUSDT', 1, 'a'],
      ['ETHUSDT', 0, 'b'],
      ['XRPUSDT', -3, 'c'],
    ] as never)
    expect(errorSpy).toHaveBeenCalledTimes(1)
    const args = errorSpy.mock.calls[0]
    expect(args).toContain(2) // dropped
    expect(args).toContain(3) // total
  })
})
