/**
 * Мониторит скорость изменения цены
 */
import { wait } from '../../helpers/wait'
import { ShiftTimeframeModel, TimeShiftModel } from '../../models'
import { log } from '../../helpers/log'
import { getLastPrice } from '../../helpers/stocksApi'
import { ShiftCandleModel } from '../../models/ShiftCandle'
import { sendUserMessage, updateCandle } from './shiftChecker.utils'

export const setupShiftsChecker = async (bot) => {
  let customTimeForWait = null

  while (true) {
    // TODO: Вернуть задержку по дефолту на 30000
    // Между итерациями задержка в 30 секунд, либо то время, которое проставили в последней итерации
    await wait(customTimeForWait ?? 1000)

    customTimeForWait = null

    const candles = await ShiftCandleModel.find().lean()

    try {
      const shifts = await TimeShiftModel.find().lean()
      const timeframes = await ShiftTimeframeModel.find().lean()

      // Нормализуем таймфреймы в объект для удобства
      const timeframesObj = timeframes.reduce((acc, el) => {
        acc[el.timeframe] = el
        return acc
      }, {})

      if (!shifts.length) {
        customTimeForWait = 60000
        continue
      }

      log.info('[ShiftsChecker] Проверяю тикеры', shifts.map(el => el.ticker))

      let customCandleUpdateTimeForWait = null

      // ВАЖНО ПРОЙТИСЬ ИМЕНО ПО ВСЕМ ШИФТАМ, А НЕ ПО УНИКАЛЬНЫМ ТИКЕРАМ
      for (let i = 0; i < shifts.length; i++) {
        await wait(customCandleUpdateTimeForWait ?? 1000)

        customCandleUpdateTimeForWait = null

        console.time('iteration time')
        // TODO: Возможно тут тоже нужна задержка между итерациями

        try {
          const shift = shifts[i]

          const { ticker, timeframe } = shift

          const price = await getLastPrice({ ticker })

          // FIXME: Почему то не подхватывается тип модели
          const candle: any = candles.find(el => (
            el.timeframe === timeframe && el.ticker === ticker
          ))

          const timeframeData = timeframesObj[shift.timeframe]

          const updatedCandle = await updateCandle({
            timeframeData,
            candle,
            price,
            shift
          })

          await sendUserMessage({
            candle: updatedCandle,
            shift,
            bot,
            timeframeData
          })
        } catch (e) {
          log.error('[ShiftsChecker] Candle update crash', e)
          customCandleUpdateTimeForWait = 20000
        }

        // TODO: Удалить console
        console.timeEnd('iteration time')
      }
    } catch (e) {
      log.error('[ShiftsChecker] Crash', e)
      customTimeForWait = 60000
    }
  }
}
