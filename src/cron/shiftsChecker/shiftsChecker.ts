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

interface ShiftCandlesNormalized {
  [key: string]: ShiftCandle
}

const getCandleKey = (tickerId: string, timeframe: string) => {
  return `${tickerId}__${timeframe}`
}

/**
 * Модуль управления кэшом свечей
 */
class ShiftCandlesUpdater {
  constructor () {
    this.init() // eslint-disable-line @typescript-eslint/no-floating-promises
  }

  candlesObj: ShiftCandlesNormalized = {}

  // Mongo config for update candles
  candlesUpdateConfig = []

  isReady = false

  init = async () => {
    const data = await retryForever(async () => await ShiftCandleModel.find().lean())
    const obj: ShiftCandlesNormalized = data.reduce((acc, item) => {
      if (!item.tickerId || !item.timeframe) {
        log.error(logPrefix, 'Candle without tickerId or timeframe', item.tickerId)
        return acc
      }
      acc[getCandleKey(item.tickerId, item.timeframe)] = item
      return acc
    }, {} as ShiftCandlesNormalized)
    this.candlesObj = obj
    this.isReady = true
    this.setupUpdater()
  }

  /**
   * Updates candles from cache to DB every n sec
   */
  setupUpdater = async () => {
    while (true) {
      if (this.candlesUpdateConfig.length) {
        try {
          await ShiftCandleModel.bulkWrite(this.candlesUpdateConfig)
          this.candlesUpdateConfig = []
        } catch (e) {
          log.error(logPrefix, 'Candles update crashed', e)
        }
      } else {
        await wait(10000) // 10 sec
      }
    }
  }

  updateCandle = (newCandle: ShiftCandle) => {
    const key = getCandleKey(newCandle.tickerId, newCandle.timeframe)
    const currentCandle = this.candlesObj[key]

    // Update only if candle was changed
    if (!currentCandle || currentCandle.updatedAt !== newCandle.updatedAt) {
      this.candlesUpdateConfig.push({
        updateOne: {
          upsert: true,
          filter: {
            tickerId: newCandle.tickerId,
            timeframe: newCandle.timeframe
          },
          update: newCandle
        }
      })
      this.candlesObj[getCandleKey(newCandle.tickerId, newCandle.timeframe)] = newCandle
    }
  }

  get get () {
    return this.candlesObj
  }

  getOne (tickerId: string, timeframe: string): ShiftCandle | undefined {
    return this.candlesObj[getCandleKey(tickerId, timeframe)]
  }
}

/**
 * Модуль управления кэшом шифтов
 */
class ShiftsUpdater {
  constructor () {
    this.init() // eslint-disable-line @typescript-eslint/no-floating-promises
  }

  shifts = []
  isReady = false
  needToBeUpdated = true // allows to enforce update

  update () {
    this.needToBeUpdated = true
  }

  init = async () => {
    this.setupUpdater()
  }

  /**
   * Updates shifts list every 'waitTime' ms
   */
  setupUpdater = async () => {
    const waitTime = 300000 // 5 min
    let timerId: NodeJS.Timeout

    while (true) {
      // skip iterations untill needToBeUpdated is true
      if (!this.needToBeUpdated) {
        await wait(1000) // 1 sec
        continue
      }

      try {
        const data = await TimeShiftModel.find().lean()
        this.shifts = data as unknown as TimeShift[]
        this.needToBeUpdated = false
        this.isReady = true
      } catch (e) {
        log.error(logPrefix, 'Shifts update crashed', e)
      } finally {
        clearTimeout(timerId)
        timerId = setTimeout(() => {
          this.needToBeUpdated = true
        }, waitTime)
      }
    }
  }

  get get () {
    return this.shifts
  }
}

export const candlesCache = new ShiftCandlesUpdater()
export const shiftsCache = new ShiftsUpdater()

// TODO: Мониторить кол-во сообщений в минуту или всего через promotheus
export const setupShiftsChecker = async (bot, isReadyToStart?: () => boolean) => {
  if (isReadyToStart) {
    await retryUntilTrue(isReadyToStart, 'setupShiftsChecker')
  }

  log.info(logPrefix + ' Init')

  await retryUntilTrue(() => candlesCache.isReady && shiftsCache.isReady, 'Shift checker init')

  while (true) {
    await fnTimeAsync(async () => {
      try {
        if (!shiftsCache.get.length) {
          log.error(logPrefix, 'No shifts found. Doing retry')
          await wait(5000)
          return // skip iteration
        }

        log.info(logPrefix, 'checking shifts', shiftsCache.get.length)
        const candlesToCheck = shiftsCache.get.reduce((acc, el) => {
          acc[getCandleKey(el.tickerId, el.timeframe)] = true
          return acc
        }, {})
        log.info(logPrefix, 'candles to check', Object.keys(candlesToCheck).length)

        let noPriceCount = 0
        let candlesChecked = 0

        const checkStart = new Date().getTime()

        // !!! ВАЖНО ПРОЙТИСЬ ИМЕНО ПО ВСЕМ ШИФТАМ, А НЕ ПО УНИКАЛЬНЫМ ТИКЕРАМ
        // TODO: Перейти с созданию и поддержания всех таймфреймов для всех бирж
        for (let i = 0; i < shiftsCache.get.length; i++) {
          try {
            const shift = shiftsCache.get[i]

            const { timeframe, tickerId } = shift

            const price = getLastPrice(tickerId, true)

            if (!price) {
              noPriceCount++
              continue
            }

            const candle: any = candlesCache.getOne(tickerId, timeframe)
            const timeframeData = SHIFT_TIMEFRAMES[shift.timeframe]

            const updatedCandle = updateCandle({
              timeframeData,
              candle,
              price,
              shift
            })

            const candleIsChanged = updatedCandle.updatedAt !== candle?.updatedAt

            if (candleIsChanged) {
              await candlesCache.updateCandle(updatedCandle)
            }

            await checkTriggeredShiftsAndSendMessage({
              candle: updatedCandle,
              shift,
              bot,
              timeframeData
            })

            candlesChecked++
          } catch (e) {
            log.error('[ShiftsChecker] Crash', e)
          }
        }

        log.info(logPrefix, 'Checked shifts', candlesChecked, '/', shiftsCache.get.length)

        if (noPriceCount > 0) {
          if (noPriceCount > 100) {
            log.error(logPrefix, 'No price errors', noPriceCount)
          }

          if (noPriceCount === shiftsCache.get.length) { // If not prices yet
            await wait(1000)
          }
        }

        const checkEnd = new Date().getTime()
        const checkTime = checkEnd - checkStart
        const minTime = 500 // min iteration time

        // If too fast - wait a litte
        if (checkTime < minTime) {
          await wait(minTime - checkTime)
        }
      } catch (e) {
        log.error(logPrefix, ' SUPER_CRASH, Падает мониторинг скорости', e)
      }
    }, logPrefix + ' ShiftsChecker iteration')
    await wait(1) // looks like it helps not to block other tasks in stasck, but not sure
  }
}
