const NodeCache = require('node-cache');

const logPrefix = '[LAST PRICE CACHE]';

/**
 * Cache with all prices by id
 *
 * No time limits for cache
 */
export const lastPriceCache = new NodeCache();

export const getLastPriceFromCache = async (id) => {
  const lastPrice = lastPriceCache.get(id);

  if (!lastPrice) {
    throw new Error(`${logPrefix} Get price error`);
  }

  return lastPrice;
};
