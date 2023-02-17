/**
 * Мониторит скорость изменения цены
 */

import { SHIFT_TIMEFRAMES } from '@/commands/shift'
import { retryForever } from '@/helpers'

import { fnTimeAsync } from '../../helpers/fnTime'
import { getLastPrice } from '../../helpers/getLastPrice'
import { log } from '../../helpers/log'
import { retryUntilTrue } from '../../helpers/retryUntilTrue'
import { wait } from '../../helpers/wait'
import { ShiftCandle, TimeShift, TimeShiftModel } from '../../models'
import { ShiftCandleModel } from '../../models/ShiftCandle'
import { checkTriggeredShiftsAndSendMessage, updateCandle } from './shiftChecker.utils'

const logPrefix = '[CANDLES UPDATER]'

/**
 * TODO
 * - Класти алерты в асинхронную очередь
 * - Метрики
 * -
 */

/**
 * New algorithm:
   * Start
    * Get all shifts
 */

interface ShiftCandlesNormalized {
  [key: string]: ShiftCandle
}

const getCandleKey = (tickerId: string, timeframe: string) => {
  return `${tickerId}__${timeframe}`
}

/**
 * Все лежит в кэше о обновляется максимально быстро.
 * Раз в какой-то время кэш асинхронно обновляется улетает в базу
 *
 * TODO: Update only changed items, no delete and create all
 */
class ShiftCandles {
  constructor () {
    this.init() // eslint-disable-line @typescript-eslint/no-floating-promises
  }

  /**
   * Means cache was updated ufter last db update
   */
  needToPushCandlesToDB = false

  candlesObj: ShiftCandlesNormalized = {}

  isReady = false

  init = async () => {
    // FIXME: Remove limit !!!
    const data = await retryForever(async () => await ShiftCandleModel.find().limit(10).lean())
    const obj: ShiftCandlesNormalized = data.reduce((acc, item) => {
      acc[getCandleKey(item.tickerId, item.timeframe)] = item
      return acc
    }, {} as ShiftCandlesNormalized)
    this.candlesObj = obj
    this.isReady = true
    this.setupUpdater() // eslint-disable-line @typescript-eslint/no-floating-promises
  }

  /**
   * Updates candles from cache to db every 10 min
   */
  setupUpdater = async () => {
    while (true) {
      if (this.needToPushCandlesToDB) {
        try {
          await this.updateToDB(Object.keys(this.candlesObj))
        } catch (e) {
          log.error(logPrefix, 'Candles update crashed', e)
        }
        this.needToPushCandlesToDB = false
        await wait(600000) // 10 min
      }
    }
  }

  updateCandle = (newCandle: ShiftCandle) => {
    const key = getCandleKey(newCandle.tickerId, newCandle.timeframe)
    const currentCandle = this.candlesObj[key]

    // Update only if candle was changed
    if (!currentCandle || currentCandle.updatedAt !== newCandle.updatedAt) {
      this.candlesObj[getCandleKey(newCandle.tickerId, newCandle.timeframe)] = newCandle
      this.needToPushCandlesToDB = true
    }
  }

  updateToDB = async (newCandles) => {
    try {
      await ShiftCandleModel.deleteMany()
      await ShiftCandleModel.insertMany(newCandles)
    } catch (err) {
      log.error(logPrefix, 'Candles update crashed', err)
    }
  }

  get get () {
    return this.candlesObj
  }

  getOne (tickerId: string, timeframe: string): ShiftCandle | undefined {
    return this.candlesObj[getCandleKey(tickerId, timeframe)]
  }
}

// FIXME: Вамжно для периодов меньше минуты (напирмер) хранить в кэше историю цен,
//  что бы минимазировать потери на итерациях в шифтах
class Shifts {
  shifts = []
  isReady = false

  constructor () {
    this.init() // eslint-disable-line @typescript-eslint/no-floating-promises
  }

  init = async () => {
    // FIXME: REmove limit
    const data = await retryForever(async () => await TimeShiftModel.find().limit(10).lean())
    this.shifts = data as unknown as TimeShift[]
    this.isReady = true
    this.setupUpdater() // eslint-disable-line @typescript-eslint/no-floating-promises
  }

  /**
   * Updates shifts list every 5 min
   */
  setupUpdater = async () => {
    while (true) {
      await wait(300000) // 5 min
      try {
        const data = await TimeShiftModel.find().limit(10).lean()
        this.shifts = data as unknown as TimeShift[]
      } catch (e) {
        log.error(logPrefix, 'Shifts update crashed', e)
      }
    }
  }

  get get () {
    return this.shifts
  }
}

// TODO: Мониторить кол-во сообщений в очереди через promotheus
// TODO: В очереди сообщение будет обработка кодов ошибок от телеги и отмена подписок на сообщения
export const setupShiftsChecker = async (bot, isReadyToStart) => {
  await retryUntilTrue(isReadyToStart, 'setupShiftsChecker')

  log.info(logPrefix + ' Init')

  const candles = new ShiftCandles()
  const shifts = new Shifts()

  await retryUntilTrue(() => candles.isReady && shifts.isReady)

  let customTimeForWait = null

  while (true) {
    await fnTimeAsync(async () => {
      try {
        if (!shifts.get.length) {
          log.error(logPrefix, 'No shifts found. Doing retry')
          await wait(5000)
          return // skip iteration
        }

        // ВАЖНО ПРОЙТИСЬ ИМЕНО ПО ВСЕМ ШИФТАМ, А НЕ ПО УНИКАЛЬНЫМ ТИКЕРАМ
        // TODO: Перейти с созданию и поддержания всех таймфреймов для всех бирж
        for (let i = 0; i < shifts.get.length; i++) {
          try {
            const shift = shifts[i]

            const { ticker, timeframe, tickerId } = shift

            const price = getLastPrice(tickerId)
            const candle: any = candles.getOne(tickerId, timeframe)
            const timeframeData = SHIFT_TIMEFRAMES[shift.timeframe]

            const updatedCandle = updateCandle({
              timeframeData,
              candle,
              price,
              shift
            })

            await candles.updateCandle(updatedCandle)

            await checkTriggeredShiftsAndSendMessage({
              candle: updatedCandle,
              shift,
              bot,
              timeframeData
            })
          } catch (e) {
            log.error('[ShiftsChecker] Crash', e)
            customTimeForWait = 5000
          }
        }
      } catch (e) {
        log.error(logPrefix, ' SUPER_CRASH, Падает мониторинг скорости', e)
        await wait(10000)
      }
    }, logPrefix + ' ShiftsChecker iteration')
  }
}
