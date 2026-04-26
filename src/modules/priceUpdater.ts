import { TickerPrices } from 'prices'

import { waitForMongoConnection } from '@/db/mongoose'
import { dropOutInvalidPrices } from '@/helpers'
import { setJobKey } from '@/helpers/setJobKey'
import { splitArray } from '@/helpers/splitArray'
import { createOncePerInterval } from '@/helpers/throttleLog'
import { timeoutPromise } from '@/helpers/timeoutPromise'
import { EMarketDataSources } from '@/marketApi/types'
import { getInstrumentsBySourceCache, InstrumentsList } from '@/models'

import { InitializationItem } from '../cron'
import { lastPriceCache } from '../helpers/getLastPrice'
import { log } from '../helpers/log'
import { retryUntilTrue } from '../helpers/retryUntilTrue'
import { wait } from '../helpers/wait'

const logPrefix = '[PRICE UPDATER]'
const CRASH_WAIT_TIME = 30000

export interface PriceUpdaterParams {
  /**
   * The source to be checked
   */
  source: EMarketDataSources
  /**
   * tickerIds length will be equal maxTickersForRequest
   */
  getPrices: (
    tickerIds: string[],
    tickersData: InstrumentsList[]
  ) => Promise<TickerPrices>
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
  onCatch?: (e: Error) => void
}

let noPricesObject = {}

// Heartbeat: ровно один INFO раз в минуту на источник, чтобы по логам было
// видно «жив ли binance», но не 70 строк в минуту.
const heartbeat = createOncePerInterval(60_000)
// Watchdog: если источник не апдейтится дольше STALE_THRESHOLD — 1 ERROR.
const STALE_THRESHOLD_MS = 120_000
const lastSuccessAt: Record<string, number> = {}
const staleAlerted: Record<string, boolean> = {}

/**
 * Поддерживает кэш с актуальными ценами для источника
 */
export const setupPriceUpdater = async ({
  getPrices,
  maxTickersForRequest = 10000,
  minTimeBetweenRequests = 100,
  source,
  isReadyToStart,
  jobKey,
  onCatch,
}: PriceUpdaterParams) => {
  await retryUntilTrue(isReadyToStart, 'Price updater for: ' + source)

  // Watchdog: если источник не апдейтился дольше порога — пишем 1 ERROR
  // (повторно не дублируем, пока не восстановится).
  setInterval(() => {
    const last = lastSuccessAt[source]
    if (!last) return
    const ageMs = Date.now() - last
    if (ageMs > STALE_THRESHOLD_MS && !staleAlerted[source]) {
      staleAlerted[source] = true
      log.error(
        logPrefix,
        source,
        'stale, no successful update for',
        Math.round(ageMs / 1000) + 's'
      )
    }
  }, 30_000)

  // Check every N min ticker without price
  setInterval(() => {
    try {
      const idsWihoutPrices = Object.keys(noPricesObject)

      if (idsWihoutPrices.length > 100) {
        log.error(logPrefix, 'No prices found for tickers', idsWihoutPrices)
      }

      noPricesObject = {}
      // N = 30 min
    } catch (e) {
      onCatch?.(e)
      log.error(logPrefix, 'Error in setInterval', e)
    }
  }, 1000 * 60 * 30)

  let lastIterationStartTime = new Date().getTime()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await waitForMongoConnection()

    try {
      let sourceInstrumentsList = []

      // Instruments fetch and error handling
      try {
        sourceInstrumentsList = await getInstrumentsBySourceCache(source)

        if (!sourceInstrumentsList.length) {
          log.error(logPrefix, source, 'Нет инструментов в списке')
          await wait(CRASH_WAIT_TIME)
          continue
        }
      } catch (e) {
        onCatch?.(e)
        log.error(logPrefix, source, 'Ошибки получения списка инструментов', e)
        await wait(CRASH_WAIT_TIME)
        continue
      }

      const arrChunks = splitArray(sourceInstrumentsList, maxTickersForRequest)

      console.time(source)

      for (let i = 0; i < arrChunks.length; i++) {
        const chunk = arrChunks[i]

        // Делаем время между итерациями более предсказуемым учитывая время запроса
        const timeToWait =
          minTimeBetweenRequests -
          (new Date().getTime() - lastIterationStartTime)

        if (timeToWait > 0) {
          await wait(timeToWait)
        }

        lastIterationStartTime = new Date().getTime()

        const tickerIds: string[] = chunk.map((el) => el.id)

        let prices = []

        // Get prices for tickers
        try {
          const pricesPromise = getPrices(tickerIds, chunk)
          prices = await timeoutPromise(pricesPromise, 100000)

          // No prices case
          if (prices?.length < tickerIds.length) {
            const idsWihoutPrices = tickerIds.filter(
              (id) => !prices.find((price) => price[2] === id)
            )

            idsWihoutPrices.forEach((id) => (noPricesObject[id] = true))
          }

          if (!prices || prices.length === 0) {
            continue
          }
        } catch (e) {
          onCatch?.(e)
          log.error(logPrefix, source, 'Update prices error', e)
          await wait(CRASH_WAIT_TIME)
          continue
        }

        prices = dropOutInvalidPrices(prices)

        // No prices case
        if (!prices.length) {
          log.error(logPrefix, source, 'No prices after filtering')
          continue
        }

        const cacheData = prices.map(([, price, tickerId]) => ({
          key: tickerId,
          val: price,
        }))

        const success = lastPriceCache.mset(cacheData)

        if (!success) {
          log.error(logPrefix, source, 'Cache update error')
          continue
        }
      }

      setJobKey(jobKey)

      const now = Date.now()
      lastSuccessAt[source] = now
      if (staleAlerted[source]) {
        log.info(logPrefix, source, 'recovered after stale')
        staleAlerted[source] = false
      }
      if (heartbeat(source)) {
        log.info(logPrefix, source, 'heartbeat ok')
      }

      console.timeEnd(source)
    } catch (e) {
      onCatch?.(e)
      log.error(logPrefix, source, 'Error in main loop', e)
      await wait(2000)
    }
  }
}
