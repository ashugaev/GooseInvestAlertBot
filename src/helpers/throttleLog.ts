/**
 * Small pure helpers for taming noisy logs.
 *
 * Used where an event repeats every cycle, but only an occasional heartbeat
 * or a transition signal is actually useful.
 */

/**
 * Returns a predicate: `true` at most once per `intervalMs` per key
 * (separate counter per key). Without a key, a single shared counter is used.
 *
 * Example: log liveness once per minute per price source.
 */
export const createOncePerInterval = (intervalMs: number) => {
  const lastAt: Record<string, number> = {}
  return (key = '_default'): boolean => {
    const now = Date.now()
    if (!lastAt[key] || now - lastAt[key] >= intervalMs) {
      lastAt[key] = now
      return true
    }
    return false
  }
}

/**
 * Returns a predicate: `true` only when the supplied key (e.g. a sorted
 * list of "missing tickers") differs from the previous call.
 */
export const createDedupByKey = () => {
  let lastKey = ''
  return (key: string): boolean => {
    if (key === lastKey) return false
    lastKey = key
    return true
  }
}
