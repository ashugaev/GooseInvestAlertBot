import { getModelForClass, prop } from '@typegoose/typegoose'

import { ESfhitTimeframes } from '@/commands/shift'
import { log } from '@/helpers'
import { ModelCache } from '@/helpers/modelCache'
import { wait } from '@/helpers/wait'

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

class VolumesCache extends ModelCache<Volumes> {
  volumesById: Record<string, Record<ESfhitTimeframes, Volumes[]>> = {}

  constructor(params) {
    super(params)

    this.volmesObjUpter()
  }

  /**
   * Keeping normalized structure
   */
  async volmesObjUpter() {
    while (true) {
      try {
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
        this.volumesById = this.items.reduce((acc, item) => {
          if (!acc[item.tickerId]) {
            acc[item.tickerId] = []
          }

          acc[item.tickerId].push(item)

          return acc
        }, {})
      } catch (e) {
        log.error(`${logPrefix} Error in volumesById updater: ${e}`)
      }

      await wait(1000 * 5)
    }
  }

  /**
   * Do not handle duplicates
   */
  volumeSignal(items: Volumes[]) {
    items.forEach((item) => {
      this.addItemToQueue({
        updateOne: {
          filter: {
            timeframe: item.timeframe,
            tickerId: item.tickerId,
            candleCreatedTime: item.candleCreatedTime,
          },
          update: {
            $set: item,
          },
          upsert: true,
        },
      })
    })
  }
}

export const volumesModelCache = new VolumesCache({
  Model: VolumesModel,
  logPref: logPrefix,
  customFind: async () => {
    return VolumesModel.aggregate([
      // Сортируем по тикеру, таймфрейму и времени создания свечи по убыванию
      { $sort: { tickerId: 1, timeframe: 1, candleCreatedTime: -1 } },
      {
        $group: {
          _id: { tickerId: '$tickerId', timeframe: '$timeframe' }, // Группируем по тикеру и таймфрейму
          documents: { $push: '$$ROOT' }, // Собираем все документы в массив
        },
      },
      {
        $project: {
          documents: { $slice: ['$documents', 30] }, // Берем первые N документов каждой группы
        },
      },
    ])
  },
})
