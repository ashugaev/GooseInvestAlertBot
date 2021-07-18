import * as Sentry from '@sentry/node'
import { stocksApi } from '../../../helpers/stocksApi'
import { TINKOFF_SENTRY_TAGS } from '../../constants'

const NodeCache = require('node-cache')

const candlesCache = new NodeCache({
  stdTTL: 40
})

export async function tinkoffGetLastPrice ({ instrumentData }) {
  try {
    const dateTo = new Date()
    const dateToISO = dateTo.toISOString()

    dateTo.setMonth(dateTo.getMonth() - 2)

    const dateFromISO = dateTo.toISOString()

    let candles = candlesCache.get(instrumentData.ticker)

    if (!candles) {
      const candlesData = await stocksApi.candlesGet({
        from: dateFromISO,
        to: dateToISO,
        interval: 'month',
        figi: instrumentData.sourceSpecificData.figi
      })

      candles = candlesData.candles

      candlesCache.set(instrumentData.ticker, candlesData.candles)
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
