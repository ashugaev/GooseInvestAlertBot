const NodeCache = require('node-cache')

const logPrefix = '[LAST PRICE CACHE]'

/**
 * Cache with all prices by id
 *
 * No time limits for cache
 */
export const lastPriceCache = new NodeCache()

/**
 * Returns the price for the given id
 */
export const getLastPrice = (id: string, noTrowIfNotFound?: boolean) => {
  if (!id) {
    throw new Error('An id is required to read the last price')
  }

  const lastPrice = lastPriceCache.get(id)

  if (!lastPrice && !noTrowIfNotFound) {
    throw new Error(`${logPrefix} Get price error for ` + id)
  }

  return lastPrice
}
