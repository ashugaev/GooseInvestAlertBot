import { clearOldCandles } from '@/cron/clearOldCandles/clearOldCandles'
import { setupPriceChecker } from '@/cron/priceChecker/priceChecker'
import { log, retry } from '@/helpers'
import { binanceGetAllInstrumentsFutures } from '@/marketApi/binance/api/getAllInstrumentsFutures'
import { bybitGetPrices } from '@/marketApi/bybit/getPrices'
import { getInstrumentsKucoin } from '@/marketApi/kucoin/getInstruments'
import { getPricesKucoin } from '@/marketApi/kucoin/getPrices'
import { lbankGetInstruments } from '@/marketApi/lbank/getInstruments'
import { lbankGetPrices } from '@/marketApi/lbank/getPrices'
import { startTests } from '@/tests/indes'

import { startCronJob } from '../helpers/startCronJob'
import { binanceGetAllInstruments } from '../marketApi/binance/api/getAllInstruments'
import {
  getBinancePrices,
  getBinancePricesFutures,
} from '../marketApi/binance/api/getPrices'
import { bybitGetAllInstruments } from '../marketApi/bybit/getInstruments'
import { coingeckoGetAllInstruments } from '../marketApi/coingecko/api/getAllInstruments'
import { coingeckoGetLastPriceById } from '../marketApi/coingecko/api/getLastPriceById'
import { tinkoffGetAllInstruments } from '../marketApi/tinkoff/api/getAllInstruments'
import { getTinkoffPrices } from '../marketApi/tinkoff/api/getPrices'
import { EMarketDataSources } from '../marketApi/types'
import { setupPriceUpdater, updateTickersList } from '../modules'
import { copyAlerts } from './copyAlerts'
import { saveFuturesMargin } from './saveFuturesMargin/saveFuturesMargin'
import { setupShiftsChecker } from './shiftsChecker'
import { tinkoffVolumesUpdater } from '@/marketApi/tinkoff/api/getVolumes'

// Processed steps list
export enum InitializationItem {
  // Tickers
  TINKOFF_TICKERS = 'TINKOFF_TICKERS',
  BINANCE_TICKERS = 'BINANCE_TICKERS',
  BINANCE_FUTURES_TICKERS = 'BINANCE_FUTURES_TICKERS',
  COINGECKO_TICKERS = 'COINGECKO_TICKERS',
  YAHOO_TICKERS = 'YAHOO_TICKERS',
  BYBIT_TICKERS = 'BYBIT_TICKERS',
  KUCOIN_TICKERS = 'KUCOIN_TICKERS',
  LBANK_TICKERS = 'LBANK_TICKERS',
  // Prices
  TINKOFF_PRICES = 'TINKOFF_PRICES',
  BINANCE_PRICES = 'BINANCE_PRICES',
  BINANCE_FUTURES_PRICES = 'BINANCE_FUTURES_PRICES',
  YAHOO_PRICES = 'YAHOO_PRICES',
  COINGECKO_PRICES = 'COINGECKO_PRICES',
  BYBIT_PRICES = 'BYBIT_PRICES',
  KUCOIN_PRICES = 'KUCOIN_PRICES',
  LBANK_PRICES = 'LBANK_PRICES',
}

// Array with all processed steps
export const appInitStatuses: InitializationItem[] = []

const isInstrumentsListUpdated = () => {
  return [
    InitializationItem.TINKOFF_TICKERS,
    InitializationItem.COINGECKO_TICKERS,
    InitializationItem.BINANCE_TICKERS,
    InitializationItem.BINANCE_FUTURES_TICKERS,
    // InitializationItem.YAHOO_TICKERS,
    InitializationItem.BYBIT_TICKERS,
    InitializationItem.KUCOIN_TICKERS,
    InitializationItem.LBANK_TICKERS,
  ].every((step) => appInitStatuses.includes(step))
}
const isAllPricesUpdated = () => {
  return [
    InitializationItem.TINKOFF_PRICES,
    InitializationItem.COINGECKO_PRICES,
    InitializationItem.BINANCE_PRICES,
    InitializationItem.BINANCE_FUTURES_PRICES,
    // InitializationItem.YAHOO_PRICES,
    InitializationItem.BYBIT_PRICES,
    InitializationItem.KUCOIN_PRICES,
    InitializationItem.LBANK_PRICES,
  ].every((step) => appInitStatuses.includes(step))
}

const appInitTime = new Date().getTime()

const isReadyToRunByTimeout = () => {
  const isTimeOut = new Date().getTime() - appInitTime > 1000 * 60 * 10 // 10 min
  if (isTimeOut) {
    log.error('Start process by timeout')
  }
  return isTimeOut
}

export const setupCheckers = () => {
  startCronJob({
    name: 'Update tinkoff futures margins',
    callback: saveFuturesMargin,
    callbackArgs: [],
    // раз в день в 3 часа 0 минут
    period: '0 3 * * *',
  })

  // FIXME: Templarory disabled
  // startCronJob({
  //   name: 'Check stat',
  //   callback: createShitEvents,
  //   callbackArgs: [bot],
  //   // раз в день в 2 часа 0 минут
  //   period: '0 2 * * *',
  //   isReadyToStart: () => isAllPricesUpdated() || isReadyToRunByTimeout()
  // })

  // startCronJob({
  //   name: 'Send stat',
  //   callback: shiftSender,
  //   callbackArgs: [bot],
  //   // раз в час
  //   period: '0 * * * *'
  // })

  // startCronJob({
  //   name: 'Update Currencies List',
  //   callback: updateTickersList({
  //     getList: getCurrenciesList,
  //     source: EMarketDataSources.yahoo,
  //     minTickersCount: 1000,
  //   }),
  //   callbackArgs: [],
  //   // Раз в день в 0 часов или при деплое
  //   period: '0 0 * * *',
  //   executeBeforeInit: true,
  //   jobKey: InitializationItem.YAHOO_TICKERS,
  // })

  /**
   * TINKOFF tickers list
   */
  startCronJob({
    name: 'Update Tinkoff tickers list',
    callback: updateTickersList({
      getList: tinkoffGetAllInstruments,
      source: EMarketDataSources.tinkoff,
      minTickersCount: 1000,
    }),
    callbackArgs: [],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
    jobKey: InitializationItem.TINKOFF_TICKERS,
  })

  /**
   * KUCOIN tickers list
   */
  startCronJob({
    name: 'Update KUCOIN tickers list',
    callback: updateTickersList({
      getList: getInstrumentsKucoin,
      source: EMarketDataSources.kucoin,
      minTickersCount: 400,
    }),
    callbackArgs: [],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
    jobKey: InitializationItem.KUCOIN_TICKERS,
  })

  startCronJob({
    name: 'Update LBANK tickers list',
    callback: updateTickersList({
      getList: lbankGetInstruments,
      source: EMarketDataSources.lbank,
      minTickersCount: 400,
    }),
    callbackArgs: [],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
    jobKey: InitializationItem.LBANK_TICKERS,
  })

  /**
   * Update COINGECKO tickers list
   */
  startCronJob({
    name: 'Update Coingecko tickers list',
    callback: updateTickersList({
      getList: coingeckoGetAllInstruments,
      source: EMarketDataSources.coingecko,
      minTickersCount: 6000,
    }),
    callbackArgs: [],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
    jobKey: InitializationItem.COINGECKO_TICKERS,
  })

  /**
   * Update BYBIT tickers list
   */
  startCronJob({
    name: 'Update BYBIT tickers list',
    callback: updateTickersList({
      getList: bybitGetAllInstruments,
      source: EMarketDataSources.bybit,
      minTickersCount: 70,
    }),
    callbackArgs: [],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
    jobKey: InitializationItem.BYBIT_TICKERS,
  })

  /**
   * Update BINANCE tickers list
   */
  startCronJob({
    name: 'Update Binance tickers list',
    callback: updateTickersList({
      getList: binanceGetAllInstruments,
      source: EMarketDataSources.binance,
      minTickersCount: 1000,
    }),
    callbackArgs: [],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
    jobKey: InitializationItem.BINANCE_TICKERS,
  })

  /**
   * Update BINANCE_FUTURES tickers list
   */
  startCronJob({
    name: 'Update Binance futures tickers list',
    callback: updateTickersList({
      getList: binanceGetAllInstrumentsFutures,
      source: EMarketDataSources.binanceFuture,
      minTickersCount: 100,
    }),
    callbackArgs: [],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
    jobKey: InitializationItem.BINANCE_FUTURES_TICKERS,
  })

  // Дамп коллекции с алертами
  startCronJob({
    name: 'Copy alerts collection',
    callback: copyAlerts,
    callbackArgs: [],
    // В полночь и при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
  })

  /**
   * Clear old candles
   */
  startCronJob({
    name: 'Clear old candles',
    callback: clearOldCandles,
    callbackArgs: [],
    // Раз в день в 0 часов или при деплое
    period: '0 0 * * *',
    executeBeforeInit: true,
  })

  /**
   * BINANCE prices updater
   */
  retry(
    async () =>
      await setupPriceUpdater({
        minTimeBetweenRequests: 1000,
        getPrices: getBinancePrices,
        source: EMarketDataSources.binance,
        jobKey: InitializationItem.BINANCE_PRICES,
      }),
    10000,
    'setupPriceUpdater for binance'
  )

  /**
   * BINANCE_FUTURES prices updater
   */
  retry(
    async () =>
      await setupPriceUpdater({
        minTimeBetweenRequests: 1000,
        getPrices: getBinancePricesFutures,
        source: EMarketDataSources.binanceFuture,
        jobKey: InitializationItem.BINANCE_FUTURES_PRICES,
      }),
    10000,
    'setupPriceUpdater for binance futures'
  )

  /**
   * KUCOIN prices updater
   */
  retry(
    async () =>
      await setupPriceUpdater({
        minTimeBetweenRequests: 3000,
        getPrices: getPricesKucoin,
        source: EMarketDataSources.kucoin,
        jobKey: InitializationItem.KUCOIN_PRICES,
      }),
    10000,
    'setupPriceUpdater for kucoin'
  )

  /**
   * YAHOO prices updater
   *
   * Quota 2000 requests per hour
   */
  // retry(
  //   async () => {
  //     await setupPriceUpdater({
  //       // hour in ms divided by quota
  //       minTimeBetweenRequests: 3600000 / 2000,
  //       getPrices: getYahooPrices,
  //       source: EMarketDataSources.yahoo,
  //       // 10 tickers it's a max for yahoo api
  //       maxTickersForRequest: 10,
  //       // isReadyToStart: () => appInitStatuses.includes(InitializationItem.YAHOO_TICKERS),
  //       jobKey: InitializationItem.YAHOO_PRICES,
  //     })
  //   },
  //   10000,
  //   'setupPriceUpdater for yahoo'
  // )

  /**
   * COINGECKO prices updater
   *
   * QUOTA: 20 calls/min
   * @see https://www.coingecko.com/en/api/pricing
   */
  retry(
    async () => {
      await setupPriceUpdater({
        minTimeBetweenRequests: 4000,
        getPrices: coingeckoGetLastPriceById,
        source: EMarketDataSources.coingecko,
        maxTickersForRequest: 500,
        jobKey: InitializationItem.COINGECKO_PRICES,
      })
    },
    10000,
    'setupPriceUpdater for COINGECKO'
  )
  /**
   * Lbank prices updater
   *
   * @see https://www.lbank.com/en-US/docs/index.html
   */
  retry(
    async () => {
      await setupPriceUpdater({
        minTimeBetweenRequests: 500,
        getPrices: lbankGetPrices,
        source: EMarketDataSources.lbank,
        jobKey: InitializationItem.LBANK_PRICES,
      })
    },
    10000,
    'setupPriceUpdater for LBANK'
  )

  /**
   * BYBIT prices updater
   *
   * QUOTA: ~50 requests per second
   * @link https://bybit-exchange.github.io/docs/inverse/#t-limits
   */
  retry(
    async () => {
      await setupPriceUpdater({
        minTimeBetweenRequests: 0,
        getPrices: bybitGetPrices,
        source: EMarketDataSources.bybit,
        jobKey: InitializationItem.BYBIT_PRICES,
      })
    },
    10000,
    'setupPriceUpdater for BYBIT'
  )

  /**
   * TINKOFF prices updater
   *
   * QUOTA: ~150rec/min
   * @link https://tinkoff.github.io/investAPI/limits/
   */
  retry(
    async () => {
      await setupPriceUpdater({
        // 1sec
        minTimeBetweenRequests: 0,
        getPrices: getTinkoffPrices,
        source: EMarketDataSources.tinkoff,
        jobKey: InitializationItem.TINKOFF_PRICES,
      })
    },
    10000,
    'setupPriceUpdater for TINKOFF'
  )

  /**
   * Мониторинг скорости
   */
  retry(async () => await setupShiftsChecker(), 10000, 'setupShiftsChecker')

  /**
   * Мониторинг достижения уровней
   */
  retry(async () => await setupPriceChecker(), 10000, 'setupPriceChecker')

  retry(
    async () => await tinkoffVolumesUpdater(),
    10000,
    'tinkoffVolumesUpdater'
  )

  /**
   * Base health checks for bot
   */
  retry(async () => await startTests(), 10000, 'tests')
}
