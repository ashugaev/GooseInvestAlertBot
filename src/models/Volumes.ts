import { getModelForClass, prop } from '@typegoose/typegoose'

import { ESfhitTimeframes } from '@/commands/shift'
import { ModelCache } from '@/helpers/modelCache'

const logPrefix = '[VOLUMES MODEL]'

/**
 * Stores volumes by timeperiod
 */
export class Volumes {
  @prop({ require: true })
  timeframe: ESfhitTimeframes

  @prop({ require: true })
  amount: number

  @prop({ required: true })
  tickerId: string

  @prop({ required: true })
  candleCreatedTime: number
}

export const VolumesModel = getModelForClass(Volumes)

/**
 * @todo Limit stored items in cache because of memory usage
 */
class VolumesCache extends ModelCache<Volumes> {
  get volumesById(): Record<string, Volumes[]> {
    // const allItems = [...this.items, ...this.uploadQueue.map((el) => el.update)]

    /**
     * res = {
     *   id: {
     *     timeframe: [
     *       candle1,
     *       candle2
     *     ]
     *   }
     * }
     */
    return this.items.reduce((acc, item) => {
      if (!acc[item.tickerId]) {
        acc[item.tickerId] = []
      }

      acc[item.tickerId].push(item)

      return acc
    }, {})
  }

  /**
   * Do not handle duplicates
   */
  volumeSignal(items: Volumes[]) {
    // const allItems = [...this.items, ...this.uploadQueue.map((el) => el.update)]
    //
    // const candleAlreadyExists = allItems.find(
    //   (i) =>
    //     i.timeframe === item.timeframe &&
    //     i.tickerId === item.tickerId &&
    //     i.candleCreatedTime === item.candleCreatedTime
    // )
    //
    // if (candleAlreadyExists) {
    //   candleAlreadyExists.update.volume = item.amount
    // } else {
    // }
    // let prevItem = this.items.find(
    //   (i) =>
    //     i.timeframe === item.timeframe &&
    //     i.tickerId === item.tickerId &&
    //     i.candleCreatedTime === item.candleCreatedTime
    // )
    //
    // if (!prevItem) {
    //   prevItem = this.uploadQueue.find(
    //     (el) =>
    //       el.update.timeframe === item.timeframe &&
    //       el.update.tickerId === item.tickerId &&
    //       el.update.candleCreatedTime === item.candleCreatedTime
    //   )
    // }
    /// TODO: не париться с аккуратной заменой и оптимизацией базы, просто класть все в очередь
    ///  !!!!!!!! Перед этим проверить будет ли происходить корректно инкрементация если за один запрос я сделаю её два раза
    // If item already created use diff in volumes
    // const volumesDiff = prevItem?.amount ? item.amount - prevItem.amount : 0
    //
    // // Создать все свечи c
    // // getCandleCreatedTime(SHIFT_TIMEFRAMES[item.timeframe])
    //
    // // Exists in queue - update volume
    // if (this.addItemToQueue()) {
    // }
    //
    // this.addItemToQueue({
    //   updateOne: {
    //     filter: {
    //       timeframe: item.timeframe,
    //       tickerId: item.tickerId,
    //       candleCreatedTime: item.candleCreatedTime,
    //     },
    //     update: {
    //       $inc: { amount: item.amount },
    //     },
    //     upsert: true,
    //   },
    // })
    // Check if exists
    // Update all levels of candles
  }
}

export const volumesModelCache = new VolumesCache({
  Model: VolumesModel,
  logPref: logPrefix,
})
