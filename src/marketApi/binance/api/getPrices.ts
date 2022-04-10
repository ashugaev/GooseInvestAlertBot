/**
 * Returns all tickers prices list
 */

import { getInstrumentsBySource } from '@models';

import { TickerPrices } from '../../../cron/priceChecker/binance';
import { log } from '../../../helpers/log';
import { EMarketDataSources } from '../../types';
import { binance } from '../utils/binance';
const NodeCache = require('node-cache');

const allBinanceInstrumentsCache = new NodeCache({
  stdTTL: 60 // sec
});

export const getBinancePrices = async (): Promise<TickerPrices> => {
  let allBinanceInstruments = allBinanceInstrumentsCache.get('null');

  if (!allBinanceInstruments) {
    allBinanceInstruments = await getInstrumentsBySource(EMarketDataSources.binance);

    if (!allBinanceInstruments) {
      throw new Error('Ошибка получения списка тикеров Binance');
    }

    allBinanceInstrumentsCache.set('null', allBinanceInstruments);
  }

  const pricesObj = await binance.prices();

  const pricesArr = Object.entries(pricesObj).map(([key, val]) => ([key, Number(val)]));

  log.info('Binance instruments', allBinanceInstruments.length);

  const pricesArrWithId: TickerPrices = pricesArr.reduce<TickerPrices>((acc, [ticker, price]) => {
    const tickerId = allBinanceInstruments.find(el => el.ticker === ticker)?.id;

    if (tickerId) {
      // @ts-expect-error Вообще типы корректные
      acc.push([ticker, price, tickerId]);
    } else {
      log.error('Can\'t find ticker in database', ticker);
    }

    return acc;
  }, []);

  return pricesArrWithId;
};
