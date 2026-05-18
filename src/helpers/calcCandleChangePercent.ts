/**
 * Growth percentage
 */
export const calcGrowPercent = (maxPrice, openPrice) =>
  (maxPrice - openPrice) / (openPrice / 100)

/**
 * Fall percentage
 */
export const calcFallPercent = (minPrice, openPrice) =>
  (openPrice - minPrice) / (openPrice / 100)
