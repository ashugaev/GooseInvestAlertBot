import * as Sentry from '@sentry/node'

import { stocksApi } from '../../../helpers/stocksApi'
import { TINKOFF_SENTRY_TAGS } from '../../constants'

const NodeCache = require('node-cache')

const candlesCache = new NodeCache({
  stdTTL: 60
})

export async function tinkoffGetLastPriceByFigi (figi: string) {
  try {
    const dateTo = new Date()
    const dateToISO = dateTo.toISOString()

    dateTo.setMonth(dateTo.getMonth() - 2)

    const dateFromISO = dateTo.toISOString()

    let candles = candlesCache.get(figi)

    if (!candles) {
      const candlesData = await stocksApi.candlesGet({
        from: dateFromISO,
        to: dateToISO,
        interval: 'month',
        figi
      })

      candles = candlesData.candles

      candlesCache.set(figi, candlesData.candles)
    }

    const lastCandle = candles[candles.length - 1]

    const lasePrice = lastCandle.c

    return lasePrice
  } catch (e) {
    Sentry.captureException('Ошибка ответа тиньковской апишски', {
      tags: TINKOFF_SENTRY_TAGS
    })

    throw new Error(e)
  }
}
