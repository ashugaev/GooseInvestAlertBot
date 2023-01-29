import { log } from './log';
import {TickerPrices} from "prices";

const logPrefix = '[INVALID PRICES CHECKER]';

/**
 * Check if price value is valid
 */
export const dropOutInvalidPrices = (prices: TickerPrices) => {
  const result = prices.filter(([ticker, price]) => (typeof price === 'number' && price > 0));

  if (result.length !== prices.length) {
    log.error(logPrefix, 'Prices partially invalid');
  }

  return result;
};
