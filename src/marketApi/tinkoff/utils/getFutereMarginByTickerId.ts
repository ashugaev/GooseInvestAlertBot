import NodeCache from 'node-cache'

import { TinkoffFuturesMargin, TinkoffFuturesMarginModel } from '../../../models/TinkoffFuturesMargin'

const instrumentsBySourceCache = new NodeCache({
  stdTTL: 86400 // 1 day
})

export const getFutureMarginByTickerId = async (tickerId: string): Promise<TinkoffFuturesMargin | null> => {
  const cached = instrumentsBySourceCache.get(tickerId)

  const stats = instrumentsBySourceCache.getStats()
  const isCacheExpired = stats.keys < 1

  if (cached) {
    return cached as TinkoffFuturesMargin
  }

  if (!isCacheExpired) {
    return null
  }

  const futureMargin = await TinkoffFuturesMarginModel.find().lean()

  instrumentsBySourceCache.mset(futureMargin.map(el => ({ key: el.tickerId, val: el })))

  return await instrumentsBySourceCache.get(tickerId)
}
