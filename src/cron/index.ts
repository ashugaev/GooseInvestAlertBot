import { retry } from '@helpers'

import { startCronJob } from '../helpers/startCronJob'
import { binanceGetAllInstruments } from '../marketApi/binance/api/getAllInstruments'
import { getBinancePrices } from '../marketApi/binance/api/getPrices'
import { coingeckoGetAllInstruments } from '../marketApi/coingecko/api/getAllInstruments'
import { coingeckoGetLastPriceById } from '../marketApi/coingecko/api/getLastPriceById'
import { getCurrenciesList } from '../marketApi/currencyConverter/getList'
import { tinkoffGetAllInstruments } from '../marketApi/tinkoff/api/getAllInstruments'
import { getTinkoffPrices } from '../marketApi/tinkoff/api/getPrices'
import { EMarketDataSources } from '../marketApi/types'
import { getYahooPrices } from '../marketApi/yahoo/getPrices'
import { setupPriceUpdater, updateTickersList } from '../modules'
import { copyAlerts } from './copyAlerts'
import { setupPriceCheckerOld } from './priceChecker'
import { saveFuturesMargin } from './saveFuturesMargin/saveFuturesMargin'
import { setupShiftsChecker } from './shiftsChecker'
import { createShitEvents } from './statChecker'
import { shiftSender } from './statSender'

// Processed steps list
export enum InitializationItem {
  // Tickers
  TINKOFF_TICKERS = 'TINKOFF_TICKERS',
  BINANCE_TICKERS = 'BINANCE_TICKERS',
  COINGECKO_TICKERS = 'COINGECKO_TICKERS',
  YAHOO_TICKERS = 'YAHOO_TICKERS',
  // Prices
  TINKOFF_PRICES = 'TINKOFF_PRICES',
  BINANCE_PRICES = 'BINANCE_PRICES',
  YAHOO_PRICES = 'YAHOO_PRICES',
  COINGECKO_PRICES = 'COINGECKO_PRICES',
}

// Array with all processed steps
export const appInitStatuses: InitializationItem[] = []

const isInstrumentsListUpdated = () => {
  return [
    InitializationItem.TINKOFF_TICKERS,
    InitializationItem.COINGECKO_TICKERS,
    InitializationItem.BINANCE_TICKERS,
    InitializationItem.YAHOO_TICKERS
  ].every((step) => appInitStatuses.includes(step))
}
const isAllPricesUpdated = () => {
  return [
    InitializationItem.TINKOFF_PRICES,
    InitializationItem.COINGECKO_PRICES,
    InitializationItem.BINANCE_PRICES,
    InitializationItem.YAHOO_PRICES
  ].every((step) => appInitStatuses.includes(step))
}

export const setupCheckers = (bot) => {
  startCronJob({
    name: 'Update tinkoff futures margins',
    callback: saveFuturesMargin,
    callbackArgs: [],
    // раз в день в 3 часа 0 минут
    period: '0 3 * * *'
  })

  // TODO: Не запускать не деве
  startCronJob({
    name: 'Check stat',
    callback: createShitEvents,
    callbackArgs: [bot],
    // раз в день в 2 часа 0 минут
    period: '0 2 * * *',
    isReadyToStart: isAllPricesUpdated
  })

  startCronJob({
    name: 'Send stat',
    callback: shiftSender,
    callbackArgs: [bot],
    // раз в час
    period: '0 * * * *'
  })

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
    executeBeforeInit: true,
    jobKey: InitializationItem.YAHOO_TICKERS
  })

  /**
   * TINKOFF tickers list
   */
  startCronJob({
    name: 'Update Tinkoff tickers list',
    callback: updateTickersList({
      getList: tinkoffGetAllInstruments,
      source: EMarketDataSources.tinkoff,
      minTickersCount: 1000
    }),
    callbackArgs: [bot],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
    jobKey: InitializationItem.TINKOFF_TICKERS
  })

  /**
   * Update COINGECKO tickers list
   */
  startCronJob({
    name: 'Update Coingecko tickers list',
    callback: updateTickersList({
      getList: coingeckoGetAllInstruments,
      source: EMarketDataSources.coingecko,
      minTickersCount: 6000
    }),
    callbackArgs: [bot],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
    jobKey: InitializationItem.COINGECKO_TICKERS
  })

  /**
   * Update BINANCE tickers list
   */
  startCronJob({
    name: 'Update Binance tickers list',
    callback: updateTickersList({
      getList: binanceGetAllInstruments,
      source: EMarketDataSources.binance,
      minTickersCount: 1000
    }),
    callbackArgs: [bot],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
    jobKey: InitializationItem.BINANCE_TICKERS
  })

  // Дамп коллекции с алертами
  startCronJob({
    name: 'Copy alerts collection',
    callback: copyAlerts,
    callbackArgs: [bot],
    // В полночь и при деплое
    period: '0 0 * * *',
    executeBeforeInit: true
  })

  /**
   * BINANCE prices updater
   */
  retry(async () => (
    await setupPriceUpdater({
      // 10s
      minTimeBetweenRequests: 10000,
      getPrices: getBinancePrices,
      source: EMarketDataSources.binance,
      // isReadyToStart: () => appInitStatuses.includes(InitializationItem.BINANCE_TICKERS),
      jobKey: InitializationItem.BINANCE_PRICES
    })
  ), 100000, 'setupPriceUpdater for binance')

  /**
   * YAHOO prices updater
   *
   * update time for all prices ~ 6-7min
   */
  retry(async () => {
    await setupPriceUpdater({
      // 1 min
      minTimeBetweenRequests: 60000,
      getPrices: getYahooPrices,
      source: EMarketDataSources.yahoo,
      // 10 tickers it's a max for yahoo api
      maxTickersForRequest: 10,
      // isReadyToStart: () => appInitStatuses.includes(InitializationItem.YAHOO_TICKERS),
      jobKey: InitializationItem.YAHOO_PRICES
    })
  }, 100000, 'setupPriceUpdater for yahoo')

  /**
   * COINGECKO prices updater
   *
   * QUOTA: 50 calls/min
   * TIME FOR UPDATE ALL TICKER: 12000 ticker / 500 per request/ 30 calls per min = ~1min
   */
  retry(async () => {
    await setupPriceUpdater({
      // 2sec
      minTimeBetweenRequests: 2000,
      getPrices: coingeckoGetLastPriceById,
      source: EMarketDataSources.coingecko,
      // 500 items works fine
      maxTickersForRequest: 500,
      jobKey: InitializationItem.COINGECKO_PRICES
      // isReadyToStart: () => appInitStatuses.includes(InitializationItem.COINGECKO_TICKERS)
    })
  }, 100000, 'setupPriceUpdater for COINGECKO')

  /**
   * TINKOFF prices updater
   *
   * QUOTA: ~150rec/min
   * @link https://tinkoff.github.io/investAPI/limits/
   */
  retry(async () => {
    await setupPriceUpdater({
      // 1sec
      minTimeBetweenRequests: 100,
      getPrices: getTinkoffPrices,
      source: EMarketDataSources.tinkoff,
      jobKey: InitializationItem.TINKOFF_PRICES
      // isReadyToStart: () => appInitStatuses.includes(InitializationItem.TINKOFF_TICKERS)
    })
  }, 100000, 'setupPriceUpdater for TINKOFF')

  /**
   * Мониторинг скорости
   */
  retry(async () => await setupShiftsChecker(bot, isAllPricesUpdated), 100000, 'setupShiftsChecker')

  /**
   * Мониторинг достижения уровней
   */
  retry(async () => await setupPriceCheckerOld(bot, isAllPricesUpdated), 100000, 'setupPriceCheckerOld')
}
