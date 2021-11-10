/**
 * Процент роста
 */
export const calcGrowPercent = (maxPrice, openPrice) => (maxPrice - openPrice) / (openPrice / 100)

/**
 * Процент падения
 */
export const calcFallPercent = (minPrice, openPrice) => (openPrice - minPrice) / (openPrice / 100)
