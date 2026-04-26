import { TickerPrices } from 'prices'

import { log } from './log'

const logPrefix = '[INVALID PRICES CHECKER]'

/**
 * Check if price value is valid
 */
export const dropOutInvalidPrices = (prices: TickerPrices) => {
  const result = prices.filter(
    ([ticker, price]) => typeof price === 'number' && price > 0
  )

  if (result.length !== prices.length) {
    log.error(
      logPrefix,
      'Prices partially invalid',
      prices.length - result.length,
      '/',
      prices.length
    )
  }

  return result
}
