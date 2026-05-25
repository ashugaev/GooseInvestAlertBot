jest.mock('@/cron/shiftsChecker/shiftsChecker', () => ({
  shiftsCache: { update: jest.fn() },
}))
jest.mock('./shiftChecker.keyboards', () => ({
  shiftAlertSettingsKeyboard: jest.fn(),
}))
jest.mock('@/helpers/bot', () => ({ getBot: jest.fn() }))
jest.mock('@/helpers/getLastPrice', () => ({ getLastPrice: jest.fn() }))
jest.mock('@/helpers/getSourceMark', () => ({ getSourceMark: jest.fn() }))
jest.mock('@/helpers/getSymbolByTicker', () => ({
  getSymbolByTicker: jest.fn(),
}))
jest.mock('@/models/Chat', () => ({ ChatModel: { updateOne: jest.fn() } }))
jest.mock('../../helpers', () => ({
  calcGrowPercent: jest.fn(),
  getCandleCreatedTime: jest.fn(),
}))
jest.mock('../../helpers/i18n', () => ({ i18n: { t: jest.fn() } }))
jest.mock('../../helpers/log', () => ({
  log: { error: jest.fn(), info: jest.fn() },
}))
jest.mock('../../models', () => ({
  getInstrumentByIdFromCache: jest.fn(),
  TimeShiftModel: { updateOne: jest.fn(), remove: jest.fn() },
}))

import { calcGrowPercent } from '../../helpers'
import { checkTriggeredShiftsAndSendMessage } from './shiftChecker.utils'

describe('checkTriggeredShiftsAndSendMessage with SHUTDOWN_MODE', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  const params = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    candle: { h: 110, l: 90, o: 100 } as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shift: {
      _id: 'shift-1',
      ticker: 'BTCUSDT',
      muted: false,
      percent: 5,
      growAlerts: true,
      fallAlerts: true,
      botId: 1,
      user: 42,
      chat: null,
    } as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timeframeData: { name_ru_plur: '5 минут' } as any,
  }

  it('short-circuits before any percent math when SHUTDOWN_MODE=true', async () => {
    process.env.SHUTDOWN_MODE = 'true'

    await checkTriggeredShiftsAndSendMessage(params)

    expect(calcGrowPercent).not.toHaveBeenCalled()
  })

  it('runs the percent math when SHUTDOWN_MODE is unset', async () => {
    delete process.env.SHUTDOWN_MODE
    ;(calcGrowPercent as jest.Mock).mockReturnValue(0)

    await checkTriggeredShiftsAndSendMessage(params)

    expect(calcGrowPercent).toHaveBeenCalled()
  })
})
