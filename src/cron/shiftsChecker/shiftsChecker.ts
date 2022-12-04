/**
 * Мониторит скорость изменения цены
 */
import { fnTimeAsync } from '../../helpers/fnTime'
import { getLastPrice } from '../../helpers/getLastPrice'
import { log } from '../../helpers/log'
import { wait } from '../../helpers/wait'
import { getShiftTimeframesObject, TimeShiftModel } from '../../models'
import { ShiftCandleModel } from '../../models/ShiftCandle'
import { sendUserMessage, updateCandle } from './shiftChecker.utils'

const logPrefix = '[CANDLES UPDATER]'

/**
 * TODO
 * - Cвечи копим и отсылаем вконце обхода
 * -
 */
export const setupShiftsChecker = async (bot) => {
  log.info(logPrefix + ' Init')

  let customTimeForWait = null

  while (true) {
    const iterationStartTime = new Date().getTime()
    let shifts = null
    let lastShiftsUpdate = null

    try {
      // Между итерациями задержка в 30 секунд, либо то время, которое проставили в последней итерации
      await wait(customTimeForWait ?? 10000)

      customTimeForWait = null

      const candles = await fnTimeAsync(async () => (
        await ShiftCandleModel.find().lean())
      , logPrefix + ' Fetch CANDLES from db')

      try {
        // Update only first time or every 15min
        if (!shifts || (lastShiftsUpdate && ((new Date().getTime() - lastShiftsUpdate) > 900000))) {
          shifts = await fnTimeAsync(async () => (
            await TimeShiftModel.find({ tickerId: { $exists: true } }).lean()
          ), logPrefix + ' Fetch shifts from db')

          lastShiftsUpdate = new Date().getTime()
        }

        // Нормализуем таймфреймы в объект для удобства
        const timeframesObj = await getShiftTimeframesObject()

        if (!shifts.length) {
          customTimeForWait = 60000
          continue
        }

        log.info(logPrefix + ' Проверяю тикеры', shifts.map(el => el.ticker))

        let customCandleUpdateTimeForWait = null

        // ВАЖНО ПРОЙТИСЬ ИМЕНО ПО ВСЕМ ШИФТАМ, А НЕ ПО УНИКАЛЬНЫМ ТИКЕРАМ
        for (let i = 0; i < shifts.length; i++) {
          await wait(customCandleUpdateTimeForWait ?? 0)

          customCandleUpdateTimeForWait = null

          try {
            const shift = shifts[i]

            const { ticker, timeframe, tickerId } = shift

            log.debug(logPrefix, 'Проверяю shift', shift)

            const price = await getLastPrice(tickerId)

            // FIXME: Почему то не подхватывается тип модели
            const candle: any = candles.find(el => (
              el.timeframe === timeframe && el.ticker === ticker
            ))

            const timeframeData = timeframesObj[shift.timeframe]

            // ~300ms
            const updatedCandle = await fnTimeAsync(async () => (
              await updateCandle({
                timeframeData,
                candle,
                price,
                shift
              })
            ), logPrefix + ' updatedCandle')

            // Check candle and send alert if it nessesary
            await fnTimeAsync(async () => (
              await sendUserMessage({
                candle: updatedCandle,
                shift,
                bot,
                timeframeData
              })
            ), logPrefix + ' sendUserMessage')
          } catch (e) {
            log.error(logPrefix, ' Candle update crash', e)
            customCandleUpdateTimeForWait = 500
          }
        }
      } catch (e) {
        log.error('[ShiftsChecker] Crash', e)
        customTimeForWait = 30000
      }
    } catch (e) {
      log.error(logPrefix, ' SUPER_CRASH, Падает мониторинг скорости', e)
      await wait(10000)
    }

    log.info(logPrefix + ' Iteration time ' + ((new Date().getTime() - iterationStartTime) / 1000).toString() + 's')
  }
}
