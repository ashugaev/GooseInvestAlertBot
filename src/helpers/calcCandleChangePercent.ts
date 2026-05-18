/**
 * Growth percentage
 */
export const calcGrowPercent = (maxPrice, openPrice) =>
  (maxPrice - openPrice) / (openPrice / 100)
