/**
 * Returns all tickers prices list
 */

import { TickerPrices } from '../../../cron/priceChecker/binance';
import { binance } from '../utils/binance';

export const getBinancePrices = async (): Promise<TickerPrices> => {
  const pricesObj = await binance.prices();

  const pricesArr: TickerPrices = Object.entries(pricesObj).map(([key, val]) => ([key, Number(val)]));

  return pricesArr;
};
