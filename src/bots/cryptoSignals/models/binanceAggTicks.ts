import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'
import { AggregatedTrade } from 'binance-api-node'

import { log } from '@/helpers'
import { chunks } from '@/helpers/array/chunks'

@modelOptions({
  schemaOptions: {
    timestamps: false,
  },
})
export class BinanceAggTicks implements AggregatedTrade {
  @prop({ required: true, index: true, unique: true })
  aggId: number

  @prop({ required: true })
  symbol: string

  @prop({ required: true })
  price: string

  @prop({ required: true })
  quantity: string

  @prop({ required: true })
  firstId: number

  @prop({ required: true })
  lastId: number

  @prop({ required: true })
  timestamp: number

  @prop({ required: true })
  isBuyerMaker: boolean

  @prop({ required: true })
  wasBestPrice: boolean
}

export const binanceAggTicksModel = getModelForClass(BinanceAggTicks)

export async function saveTicks(ticks: AggregatedTrade[], chunkSize = 1000) {
  const saveChunk = async (chunk: AggregatedTrade[]) => {
    const bulkWrite = chunk.map((tick) => ({
      updateOne: {
        upsert: true,
        filter: {
          aggId: tick.aggId,
          timestamp: tick.timestamp,
          symbol: tick.symbol,
        },
        update: {
          $set: {
            ...tick,
          },
        },
      },
    }))

    try {
      await binanceAggTicksModel.bulkWrite(bulkWrite)
    } catch (e) {
      console.log('error while saving ticks ', e)
    }
  }

  // Разбиваем тики на чанки по 5000 элементов
  const tickChunks = chunks(ticks, chunkSize)

  let i = 0
  // Последовательно сохраняем каждый чанк
  for (const chunk of tickChunks) {
    i++
    await saveChunk(chunk)
    log.info(`Chunk ${i} saved`)
  }
}
