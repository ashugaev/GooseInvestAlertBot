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
 * TODO: Сохранять историю цен за 5 мин
 */
class ShiftCandlesUpdater {
  constructor () {
    this.init() // eslint-disable-line @typescript-eslint/no-floating-promises
  }

  needToPushCandlesToDB = false

  candlesObj: ShiftCandlesNormalized = {}

  // Mongo config for update candles
  candlesUpdateConfig = []

  isReady = false

  init = async () => {
    // FIXME: Remove limit !!!
    const data = await retryForever(async () => await ShiftCandleModel.find().lean())
    // @ts-expect-error FIXME: Fix types
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
    this.setupUpdater() // eslint-disable-line @typescript-eslint/no-floating-promises
  }

  /**
   * Updates candles from cache to db every 10 min
   */
  setupUpdater = async () => {
    while (true) {
      if (this.needToPushCandlesToDB) {
        try {
          await this.updateToDB()
          this.needToPushCandlesToDB = false
        } catch (e) {
          log.error(logPrefix, 'Candles update crashed', e)
        }
      } else {
        await wait(300000) // 5 min
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
          filter: { tickerId: newCandle.tickerId },
          update: newCandle
        }
      })
      this.candlesObj[getCandleKey(newCandle.tickerId, newCandle.timeframe)] = newCandle
      this.needToPushCandlesToDB = true
    }
  }

  updateToDB = async () => {
    try {
      await ShiftCandleModel.bulkWrite(this.candlesUpdateConfig)
      this.candlesUpdateConfig = []
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
    this.setupUpdater() // eslint-disable-line @typescript-eslint/no-floating-promises
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

// TODO: Мониторить кол-во сообщений в очереди через promotheus
// TODO: В очереди сообщение будет обработка кодов ошибок от телеги и отмена подписок на сообщения
// TODO: Сделать проверку свеч до 5 минут другим алгоритмом
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

        log.info(logPrefix, 'checking', shiftsCache.get.length)

        let noPriceCount = 0

        const checkStart = new Date().getTime()

        // ВАЖНО ПРОЙТИСЬ ИМЕНО ПО ВСЕМ ШИФТАМ, А НЕ ПО УНИКАЛЬНЫМ ТИКЕРАМ
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

              await checkTriggeredShiftsAndSendMessage({
                candle: updatedCandle,
                shift,
                bot,
                timeframeData
              })
            }
          } catch (e) {
            log.error('[ShiftsChecker] Crash', e)
          }
        }

        if (noPriceCount > 0) {
          log.error(logPrefix, 'Np price errors', noPriceCount)
          if (noPriceCount === shiftsCache.get.length) { // If not prices yet
            await wait(1000)
          }
          noPriceCount = 0
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
