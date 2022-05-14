import { getInstrumentsBySource } from '@models';
import NodeCache from 'node-cache';

import { EMarketDataSources } from '../types';

const allYahooInstrumentsCache = new NodeCache({
  stdTTL: 600 // sec
});

export const getYahooPrices = async () => {
  let allInstruments = allYahooInstrumentsCache.get('null');

  if (!allInstruments) {
    allInstruments = await getInstrumentsBySource(EMarketDataSources.binance);

    if (!allInstruments?.length) {
      throw new Error('Ошибка получения списка тикеров Yahoo');
    }

    allYahooInstrumentsCache.set('null', allInstruments);
  }

  const pricesByTicker = {};

  // Можно брать из API но не хочется делать доп запрос
  const baseTicker = allInstruments.filter(el => el.ticker.endsWith('USD'));

  /**
   * Запросить базовые пары
   * Зпросить популярное, либо приритетный список (то, чего не хватает)
   * Рассчитать те пары, которых не хватает
   * Собрать нужную структуру данных
   */
  // const pricesObj = await binance.prices();
  //
  // const pricesArr = Object.entries(pricesObj).map(([key, val]) => ([key, Number(val)]));
  //
  // log.info('Binance instruments', allBinanceInstruments.length);
  //
  // const pricesArrWithId: TickerPrices = pricesArr.reduce<TickerPrices>((acc, [ticker, price]) => {
  //   const tickerId = allBinanceInstruments.find(el => el.ticker === ticker)?.id;
  //
  //   if (tickerId) {
  //     // @ts-expect-error Вообще типы корректные
  //     acc.push([ticker, price, tickerId]);
  //   } else {
  //     log.error(logPrefix, 'Can\'t find Binance ticker in database for price from API', ticker);
  //   }
  //
  //   return acc;
  // }, []);

  // return pricesArrWithId;
};
