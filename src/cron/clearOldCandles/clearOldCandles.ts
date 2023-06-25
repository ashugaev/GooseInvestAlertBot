import { SHIFT_TIMEFRAMES } from '@/commands/shift'
import { log } from '@/helpers'
import { ShiftCandleModel } from '@/models'

export const clearOldCandles = async () => {
  const config = []

  Object.values(SHIFT_TIMEFRAMES).forEach((timeframe) => {
    config.push({
      deleteMany: {
        filter: {
          timeframe: timeframe.timeframe,
          updatedAt: {
            // Delete all items whick wasn't updated whole during current candle lifetime
            $lt: Date.now() - timeframe.lifetime - 1,
          },
        },
      },
    })
  })

  const res = await ShiftCandleModel.bulkWrite(config)
  log.info('[Clear old candles] Deleted', res.deletedCount, 'candles')
}
