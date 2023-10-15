import { AggregatedTrade } from 'binance-api-node'

import { binanceAggTicksModel } from '@/bots/cryptoSignals/models/binanceAggTicks'
import { binance } from '@/marketApi/binance/utils/binance'

export const getTicks = async ({
  startTime,
  fromId,
  symbol,
}: {
  symbol: string
  fromId?: string
  startTime?: number
}): Promise<AggregatedTrade[]> => {
  const params: {
    symbol: string
    fromId?: string
    startTime?: number
    endTime?: number
    limit?: number
  } = {
    symbol: symbol.toUpperCase() + 'USDT',
    limit: 1000,
  }

  if (startTime) {
    params.startTime = startTime
  }

  let newTicks: AggregatedTrade[] = []

  if (fromId) {
    params.fromId = fromId

    // Check if we have this tick in db
    const foundTick = await binanceAggTicksModel.findOne({
      aggId: Number(fromId),
    })

    // Fist checking DB cache
    if (foundTick) {
      const allTicksFromId = await binanceAggTicksModel
        .find({
          symbol: params.symbol,
          aggId: { $gte: Number(fromId) },
        })
        .sort({ aggId: 1 })
        .lean()
        .exec()

      // Проверяем неразрывность aggId
      for (let i = 0; i < allTicksFromId.length - 1; i++) {
        const diff = allTicksFromId[i + 1].aggId - allTicksFromId[i].aggId

        if (diff !== 1) {
          newTicks = allTicksFromId.slice(0, i + 1)
          break
        }

        // if last and no break - all ticks are ok
        if (i === allTicksFromId.length - 2) {
          newTicks = allTicksFromId
        }
      }

      console.log('getTicks from DB', newTicks.length)
    }
  }

  // Binance as a fallback
  if (!newTicks.length) {
    newTicks = await binance.aggTrades(params)
  } else {
    console.info('Use ticks from DB')
  }

  return newTicks
}
