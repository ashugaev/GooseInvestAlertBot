import { startCronJob } from '../helpers/startCronJob';
import { binanceGetAllInstruments } from '../marketApi/binance/api/getAllInstruments';
import { getBinancePrices } from '../marketApi/binance/api/getPrices';
import { coingeckoGetAllInstruments } from '../marketApi/coingecko/api/getAllInstruments';
import { getCurrenciesList } from '../marketApi/currencyConverter/getList';
import { tinkoffGetAllInstruments } from '../marketApi/tinkoff/api/getAllInstruments';
import { EMarketDataSources } from '../marketApi/types';
import { getYahooPrices } from '../marketApi/yahoo/getPrices';
import { setupPriceUpdater, updateTickersList } from '../modules';
import { copyAlerts } from './copyAlerts';
import { setupPriceCheckerOld } from './priceChecker';
import { setupShiftsChecker } from './shiftsChecker';
import { createShitEvents } from './statChecker';
import { shiftSender } from './statSender';

const isProduction = process.env.NODE_EVN === 'production';

export const setupCheckers = (bot) => {
  // TODO: Не запускать не деве
  startCronJob({
    name: 'Check stat',
    callback: createShitEvents,
    callbackArgs: [bot],
    // раз в день в 2 часа 0 минут
    period: '0 2 * * *'
  });

  startCronJob({
    name: 'Send stat',
    callback: shiftSender,
    callbackArgs: [bot],
    // раз в час
    period: '0 * * * *'
  });

  startCronJob({
    name: 'Update Currencies List',
    callback: updateTickersList({
      getList: getCurrenciesList,
      source: EMarketDataSources.yahoo,
      minTickersCount: 1000
    }),
    callbackArgs: [bot],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: isProduction
  });

  /**
   * TINKOFF tickers list
   */
  startCronJob({
    name: 'Update Tinkoff tickers list List',
    callback: updateTickersList({
      getList: tinkoffGetAllInstruments,
      source: EMarketDataSources.tinkoff,
      minTickersCount: 1000
    }),
    callbackArgs: [bot],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: isProduction
  });

  /**
   * Update COINGECKO tickers list
   */
  startCronJob({
    name: 'Update Coingecko tickers list List',
    callback: updateTickersList({
      getList: coingeckoGetAllInstruments,
      source: EMarketDataSources.coingecko,
      minTickersCount: 1000
    }),
    callbackArgs: [bot],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: isProduction
  });

  /**
   * Update BINANCE tickers list
   */
  startCronJob({
    name: 'Update Binance tickers list List',
    callback: updateTickersList({
      getList: binanceGetAllInstruments,
      source: EMarketDataSources.binance,
      minTickersCount: 1000
    }),
    callbackArgs: [bot],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: isProduction
  });

  // Дамп коллекции с алертами
  startCronJob({
    name: 'Copy alerts collection',
    callback: copyAlerts,
    callbackArgs: [bot],
    // В полночь и при деплое
    period: '0 0 * * *',
    executeBeforeInit: true
  });

  // Мониторинг достижения уровней
  setupPriceCheckerOld(bot);

  /**
   * BINANCE prices updater
   */
  setupPriceUpdater({
    // 10s
    minTimeBetweenRequests: 10000,
    getPrices: getBinancePrices,
    source: EMarketDataSources.binance
  });

  /**
   * YAHOO prices updater
   *
   * update time for all prices ~ 6-7min
   */
  setupPriceUpdater({
    // 1min
    minTimeBetweenRequests: 60,
    getPrices: getYahooPrices,
    source: EMarketDataSources.yahoo,
    // 10 tickers it's a max for yahoo api
    maxTickersForRequest: 10
  });

  // Мониторинг скорости
  setupShiftsChecker(bot);
};
