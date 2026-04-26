import {
  AlertFailureBucket,
  classifyAlertFailure,
  emptyBuckets,
  topTickersInBucket,
} from '@/cron/priceChecker/classifyAlertFailure'
import {
  checkAlertTriggered,
  sendTriggeredAlert,
} from '@/cron/priceChecker/priceChecker.utils'
import { log } from '@/helpers'
import { fnTimeAsync } from '@/helpers/fnTime'
import { getLastPrice } from '@/helpers/getLastPrice'
import { retryUntilTrue } from '@/helpers/retryUntilTrue'
import { createOncePerInterval } from '@/helpers/throttleLog'
import { wait } from '@/helpers/wait'
import {
  getInstrumentByIdFromCache,
  isInstrumentsByIdCacheReady,
  PriceAlert,
  priceAlertCache,
} from '@/models'

const logPrefix = '[CHECK ALERTS]'
const itemsCheckTime = 500

// Avoid duplicates
const trigeredCache = new Set<string>()

// Aggregated bucket log — once per minute, so we can see the distribution
// (noInstrument / noPrice / invalidPrice / error) and the top dead tickers.
const failureSummaryHeartbeat = createOncePerInterval(60_000)

export const setupPriceChecker = async () => {
  await retryUntilTrue(
    () => priceAlertCache.isReady,
    logPrefix + ' setupPriceChecker'
  )
  // Without this gate, on cold start instrumentsByIdCache is still empty
  // (autoUpdateInstrumentsListCache takes ~5–8 minutes), and every alert
  // gets !instrumentData -> 100% failure-spam until the cache loads.
  await retryUntilTrue(
    isInstrumentsByIdCacheReady,
    logPrefix + ' setupPriceChecker waits instruments cache'
  )

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await fnTimeAsync(async () => {
        const checkStart = Date.now()

        if (!priceAlertCache.get.length) {
          log.error(logPrefix, 'Нет алертов для проверки')
          await wait(1000)
          return
        }

        const buckets = emptyBuckets()
        const alertsTriggeredList = []

        for (let i = 0; i < priceAlertCache.get.length; i++) {
          const alert: PriceAlert = priceAlertCache.get[i]
          if (!alert) continue
          // Build `tag` inside try — some cached alerts have shown up without
          // user/tickerId, and otherwise the throw would escape into the
          // outer SUPERCRASH branch and tank the whole iteration over one
          // bad document.
          let tag = ''
          try {
            tag = alert.tickerId + ':' + alert.user.toString()
            const instrumentData = await getInstrumentByIdFromCache(
              alert.tickerId,
              true,
              true
            )
            const lastPrice = getLastPrice(alert.tickerId, true)
            const failure = classifyAlertFailure({
              hasInstrument: Boolean(instrumentData),
              lastPrice,
            })

            if (failure) {
              buckets[failure].push(tag)
              continue
            }

            const isAlertTriggered = checkAlertTriggered(
              alert,
              lastPrice as number
            )

            if (isAlertTriggered) {
              alertsTriggeredList.push(tag)

              if (trigeredCache.has(alert._id.toString())) {
                log.error(
                  logPrefix,
                  'Попытка повторного алерта',
                  alert._id.toString()
                )

                priceAlertCache.removeItemFromCache(alert._id.toString())

                continue
              }

              // Avoid duplicates
              trigeredCache.add(alert._id.toString())

              // NO AWAIT FOR PERFORMANCE
              sendTriggeredAlert(alert, instrumentData)
            }
          } catch (e) {
            buckets[AlertFailureBucket.Error].push(tag)
            log.error(logPrefix, 'Failed to process alert', tag, e)
          }
        }

        if (alertsTriggeredList.length) {
          log.info(logPrefix, 'Triggered alerts', alertsTriggeredList)
        }

        const totalFailed =
          buckets[AlertFailureBucket.NoInstrument].length +
          buckets[AlertFailureBucket.NoPrice].length +
          buckets[AlertFailureBucket.InvalidPrice].length +
          buckets[AlertFailureBucket.Error].length

        if (totalFailed > 150 && failureSummaryHeartbeat()) {
          log.error(
            logPrefix,
            'Failed to check alerts',
            totalFailed,
            '/',
            priceAlertCache.get.length,
            {
              noInstrument: buckets[AlertFailureBucket.NoInstrument].length,
              noPrice: buckets[AlertFailureBucket.NoPrice].length,
              invalidPrice: buckets[AlertFailureBucket.InvalidPrice].length,
              error: buckets[AlertFailureBucket.Error].length,
              topNoInstrument: topTickersInBucket(
                buckets[AlertFailureBucket.NoInstrument]
              ),
              topNoPrice: topTickersInBucket(
                buckets[AlertFailureBucket.NoPrice]
              ),
              topInvalidPrice: topTickersInBucket(
                buckets[AlertFailureBucket.InvalidPrice]
              ),
            }
          )
        }

        const timeToWait = itemsCheckTime - (Date.now() - checkStart)
        if (timeToWait > 0) {
          await wait(timeToWait)
        }
      }, logPrefix + ' Проверка срабатывания алертов')
    } catch (e) {
      log.error(logPrefix + 'SUPERCRASH Падает мониториг цен', e)
      await wait(1000)
    }
  }
}
