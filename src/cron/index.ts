import { startCronJob } from '../helpers/startCronJob';
import { getBinancePrices } from '../marketApi/binance/api/getPrices';
import { getCurrenciesList } from '../marketApi/currencyConverter/getList';
import { EMarketDataSources } from '../marketApi/types';
import { setupPriceUpdater, updateTickersList } from '../modules';
import { copyAlerts } from './copyAlerts';
import { instrumentsListUpdater } from './instrumentsListUpdater';
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
    name: 'Update Instruments List',
    callback: instrumentsListUpdater,
    callbackArgs: [bot],
    // раз день в 3 часа
    period: '0 3 * * *',
    // eslint-disable-next-line no-unneeded-ternary
    executeBeforeInit: !!isProduction
  });

  startCronJob({
    name: 'Update Currencies List',
    callback: updateTickersList({
      getList: getCurrenciesList,
      source: EMarketDataSources.yahoo,
      minTickersCount: 1000
    }),
    callbackArgs: [bot],
    // Раз в неделю или при деплое
    period: '0 0 * * 0',
    // eslint-disable-next-line no-unneeded-ternary
    executeBeforeInit: isProduction ? true : true
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
   */
  setupPriceUpdater({
    // 2min
    minTimeBetweenRequests: 120000,
    getPrices: getBinancePrices,
    source: EMarketDataSources.yahoo
  });

  // Мониторинг скорости
  setupShiftsChecker(bot);
};
