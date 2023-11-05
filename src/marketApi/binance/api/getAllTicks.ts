import { log } from '@/helpers'
import { getTicks } from '@/marketApi/binance/api/getTicks'

export const getAllTicks = async (dateFrom: Date, symbol: string) => {
  let allTicks = []
  let fromId = undefined

  while (true) {
    const params = {
      fromId: fromId,
      symbol,
    }

    if (!fromId) {
      // @ts-ignore
      params.startTime = dateFrom.getTime()
    }

    const ticks = await getTicks(params)

    if (ticks.length < 10) {
      break
    }

    allTicks = allTicks.concat(ticks)
    fromId = ticks[ticks.length - 1].aggId.toString()

    log.info(
      `Got ${allTicks.length} ticks. Last tick date: ${new Date(
        ticks[ticks.length - 1].timestamp
      ).toISOString()}`
    )
  }

  return allTicks
}
