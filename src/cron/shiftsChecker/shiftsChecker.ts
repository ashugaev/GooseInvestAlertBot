/**
 * Мониторит скорость изменения цены
 */
import { log } from '../../helpers/log';
import { getLastPrice } from '../../helpers/stocksApi';
import { wait } from '../../helpers/wait';
import { getShiftTimeframesObject, TimeShiftModel } from '../../models';
import { ShiftCandleModel } from '../../models/ShiftCandle';
import { sendUserMessage, updateCandle } from './shiftChecker.utils';

export const setupShiftsChecker = async (bot) => {
  let customTimeForWait = null;

  while (true) {
    try {
      // Между итерациями задержка в 30 секунд, либо то время, которое проставили в последней итерации
      await wait(customTimeForWait ?? 30000);

      customTimeForWait = null;

      const candles = await ShiftCandleModel.find().lean();

      try {
        const shifts = await TimeShiftModel.find().lean();

        // Нормализуем таймфреймы в объект для удобства
        const timeframesObj = await getShiftTimeframesObject();

        if (!shifts.length) {
          customTimeForWait = 60000;
          continue;
        }

        log.info('[ShiftsChecker] Проверяю тикеры', shifts.map(el => el.ticker));

        let customCandleUpdateTimeForWait = null;

        // ВАЖНО ПРОЙТИСЬ ИМЕНО ПО ВСЕМ ШИФТАМ, А НЕ ПО УНИКАЛЬНЫМ ТИКЕРАМ
        for (let i = 0; i < shifts.length; i++) {
          await wait(customCandleUpdateTimeForWait ?? 1000);
          // Время самой итерации в среднем 150-400мс

          customCandleUpdateTimeForWait = null;

          try {
            const shift = shifts[i];

            const { ticker, timeframe, tickerId } = shift;

            const price = await getLastPrice({ id: tickerId });

            // FIXME: Почему то не подхватывается тип модели
            const candle: any = candles.find(el => (
              el.timeframe === timeframe && el.ticker === ticker
            ));

            const timeframeData = timeframesObj[shift.timeframe];

            const updatedCandle = await updateCandle({
              timeframeData,
              candle,
              price,
              shift
            });

            await sendUserMessage({
              candle: updatedCandle,
              shift,
              bot,
              timeframeData
            });
          } catch (e) {
            log.error('[ShiftsChecker] Candle update crash', e);
            customCandleUpdateTimeForWait = 20000;
          }
        }
      } catch (e) {
        log.error('[ShiftsChecker] Crash', e);
        customTimeForWait = 60000;
      }
    } catch (e) {
      log.error('[SUPER_CRASH] Падает мониторинг скорости', e);
      await wait(10000);
    }
  }
};
