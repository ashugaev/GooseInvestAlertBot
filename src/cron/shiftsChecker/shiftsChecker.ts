/**
 * Мониторит скорость изменения цены
 */
import { wait } from '../../helpers/wait'
import { getUniqSymbols, getUniqTimeShiftTickers, ShiftCandle, ShiftTimeframeModel, TimeShiftModel } from '../../models'
import { log } from '../../helpers/log'
import { getLastPrice } from '../../helpers/stocksApi'
import { ShiftCandleModel } from '../../models/ShiftCandle'
import { sendUserMessage, updateCandle } from './shiftChecker.utils'

export const setupShiftsChecker = async (bot) => {
  let customTimeForWait = null

  while (true) {
    // TODO: Возможно нужна другая задержка. Подумать перед деплоем.
    // Между итерациями задержка в 30 секунд, либо то время, которое проставили в последней итерации
    await wait(customTimeForWait ?? 30000)

    customTimeForWait = null

    const candles = ShiftCandleModel.find()

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

      for (let i = 0; i < shifts.length; i++) {
        await wait(customCandleUpdateTimeForWait ?? 1000)

        customCandleUpdateTimeForWait = null

        console.time('iteration pause')
        // TODO: Возможно тут тоже нужна задержка между итерациями

        try {
          const shift = shifts[i]

          const { ticker, timeframe, user } = shift

          const price = getLastPrice({ ticker })

          // FIXME: Почему то не подхватывается тип модели
          const candle: any = candles.find(el => (
            el.timeframe === timeframe && el.ticker === ticker
          ))

          const timeframeData = timeframes[candle.timeframe]

          const updatedCanlde = await updateCandle({
            timeframe: timeframeData,
            candle,
            price
          })

          await sendUserMessage({
            candle: updatedCanlde,
            shift,
            user,
            bot,
            timeframe
          })
        } catch (e) {
          log.error('[ShiftsChecker] Candle update crash', e)
          customCandleUpdateTimeForWait = 20000
        }

        // TODO: Удалить console
        console.timeEnd('iteration pause')
      }
    } catch (e) {
      log.error('[ShiftsChecker] Crash', e)
      customTimeForWait = 60000
    }
  }
}
