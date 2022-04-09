import { EMarketDataSources } from '@models';

import { startCronJob } from '../helpers/startCronJob';
import { getBinancePrices } from '../marketApi/binance/api/getPrices';
import { copyAlerts } from './copyAlerts';
import { instrumentsListUpdater } from './instrumentsListUpdater';
import { setupPriceChecker } from './priceChecker/binance';
import { setupShiftsChecker } from './shiftsChecker';
import { createShitEvents } from './statChecker';
import { shiftSender } from './statSender';

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
    // TODO: Не проставлять в dev окружении
    executeBeforeInit: true
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
  // setupPriceCheckerOld(bot);

  // TODO: Запускать чекеры через одну команду
  //

  // Binance
  setupPriceChecker({
    source: EMarketDataSources.coingecko,
    getPrices: getBinancePrices,
    minTimeBetweenRequests: 10000,
    sendUserMessage: () => {},
    waitTimeBeforeStart: 1000
  });

  // Мониторинг скорости
  setupShiftsChecker(bot);
};
