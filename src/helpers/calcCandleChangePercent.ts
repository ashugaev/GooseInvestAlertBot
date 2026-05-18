/**
 * Growth percentage
 */
export const calcGrowPercent = (maxPrice, openPrice) =>
  (maxPrice - openPrice) / (openPrice / 100)

/**
 * Fall percentage
 */
const calcFallPercent = (minPrice, openPrice) =>
  (openPrice - minPrice) / (openPrice / 100)
