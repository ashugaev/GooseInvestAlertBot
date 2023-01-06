
const NodeCache = require('node-cache')

const logPrefix = '[LAST PRICE CACHE]'

/**
 * Cache with all prices by id
 *
 * No time limits for cache
 */
export const lastPriceCache = new NodeCache()

/**
 * Вернет цену по id
 */
export const getLastPrice = async (id: string) => {
  if (!id) {
    throw new Error('Необходимо предоставить id для получения последней цены')
  }

  const lastPrice = lastPriceCache.get(id)

  if (!lastPrice) {
    throw new Error(`${logPrefix} Get price error for ` + id)
  }

  return lastPrice
}
