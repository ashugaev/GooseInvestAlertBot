/**
 * Pure cache-layout helper for InstrumentsList. Lives in its own module so
 * unit tests can import it without triggering the side-effecting IIFE in
 * InstrumentsList.ts (which connects to Mongo on import).
 */

interface BulkSetCache {
  mset: (data: { key: string; val: unknown }[]) => boolean
}

interface CacheableItem {
  id: string
  ticker: string
}

/**
 * Lays out items into both caches. Filters out items with empty/missing id
 * (NodeCache.mset throws on empty keys) and skips ticker grouping for
 * items that have no ticker (the model allows it).
 */
export const populateInstrumentsCaches = (
  items: CacheableItem[],
  byIdCache: BulkSetCache,
  byTickerCache: BulkSetCache
): void => {
  const cacheItemsById = items
    .filter((item) => typeof item.id === 'string' && item.id.length > 0)
    .map((item) => ({ key: item.id, val: item }))
  byIdCache.mset(cacheItemsById)

  const objByTicker = items.reduce<Record<string, unknown[]>>((acc, item) => {
    if (!item.ticker) return acc
    if (acc[item.ticker]) {
      acc[item.ticker].push(item)
    } else {
      acc[item.ticker] = [item]
    }
    return acc
  }, {})

  const cacheByTicker = Object.entries(objByTicker).map(([key, val]) => ({
    key,
    val,
  }))
  byTickerCache.mset(cacheByTicker)
}
