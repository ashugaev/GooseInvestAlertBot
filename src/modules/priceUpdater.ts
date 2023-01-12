import { dropOutInvalidPrices } from '@helpers'
import { getInstrumentsBySourceCache, InstrumentsList } from '@models'
import { TickerPrices } from 'prices'

import { InitializationItem } from '../cron'
import { lastPriceCache } from '../helpers/getLastPrice'
import { log } from '../helpers/log'
import { retryUntilTrue } from '../helpers/retryUntilTrue'
import { setJobKey } from '../helpers/setJobKey'
import { splitArray } from '../helpers/splitArray'
import { wait } from '../helpers/wait'
import { EMarketDataSources } from '../marketApi/types'

const logPrefix = '[PRICE UPDATER]'
const CRASH_WAIT_TIME = 30000
const lastUpdateTime = {}

export interface PriceUpdaterParams {
  /**
   * The source to be checked
   */
  source: EMarketDataSources
  /**
   * tickerIds length will be equal maxTickersForRequest
   */
  getPrices: (tickerIds: string[], tickersData: InstrumentsList[]) => Promise<TickerPrices>
  /**
   * The maximum number that can be updated for one request of 'updateRequest' callback
   * null means all tickers for one request
   */
  maxTickersForRequest?: number
  /**
   * Mit timeout between requests
   * In ms
   */
  minTimeBetweenRequests?: number
  /**
   * Check if this job ready to be started
   */
  isReadyToStart?: () => boolean
  jobKey: InitializationItem
}

/**
 * Поддерживает кэш с актуальными ценами для источника
 */
export const setupPriceUpdater = async ({
  getPrices,
  maxTickersForRequest = 10000,
  minTimeBetweenRequests = 100,
  source,
  isReadyToStart,
  jobKey
}: PriceUpdaterParams) => {
  await retryUntilTrue(isReadyToStart, 'Price updater for: ' + source)

  let lastIterationStartTime = new Date().getTime()

  while (true) {
    let sourceInstrumentsList = []

    // Instruments fetch and error handling
    try {
      sourceInstrumentsList = await getInstrumentsBySourceCache(source)

      if (!sourceInstrumentsList.length) {
        log.error(logPrefix, 'Нет инструментов в списке')
        await wait(CRASH_WAIT_TIME)
        continue
      }
    } catch (e) {
      log.error(logPrefix, 'Ошибки получения списка инструментов', e)
      await wait(CRASH_WAIT_TIME)
      continue
    }

    const arrChunks = splitArray(sourceInstrumentsList, maxTickersForRequest)

    console.time(source)

    for (let i = 0; i < arrChunks.length; i++) {
      const chunk = arrChunks[i]

      // Делаем время между итерациями более предсказуемым учитывая время запроса
      const timeToWait = minTimeBetweenRequests - (new Date().getTime() - lastIterationStartTime)

      if (timeToWait > 0) {
        log.info(logPrefix, 'waiting', timeToWait)
        await wait(timeToWait)
      }

      lastIterationStartTime = new Date().getTime()

      const tickerIds: string[] = chunk.map(el => el.id)

      let prices = []

      // Get prices for tickers
      try {
        prices = await getPrices(tickerIds, chunk)

        // No prices case
        if (!prices?.length) {
          log.error(logPrefix, 'No prices found for tickers', tickerIds)
          continue
        }
      } catch (e) {
        log.error(logPrefix, 'Update prices error', e)
        await wait(CRASH_WAIT_TIME)
        continue
      }

      prices = dropOutInvalidPrices(prices)

      // No prices case
      if (!prices.length) {
        log.error(logPrefix, 'No prices after filtering')
        continue
      }

      const cacheData = prices.map(([ticker, price, tickerId]) => ({
        key: tickerId,
        val: price
      }))

      const success = lastPriceCache.mset(cacheData)

      if (!success) {
        log.error(logPrefix, 'Cache update error')
        continue
      }
    }

    log.info(logPrefix + 'Price cache update END ' + source)

    const currentTime = new Date().getTime()
    // eslint-disable-next-line max-len
    lastUpdateTime[source] && (log.info(logPrefix + 'Time betweed updates ' + ((currentTime - lastUpdateTime[source]) / 1000).toString() + 's'))
    lastUpdateTime[source] = new Date().getTime()

    setJobKey(jobKey)

    console.timeEnd(source)
  }
}
