// Get the unique tickers from all alerts
// The name is no longer fully accurate because we group by id, not by ticker
import { log } from '@/helpers'
import { PriceAlert } from '@/models'

export const getUniqTickersData = (alerts: PriceAlert[]): PriceAlert[] => {
  return Object.values(
    alerts.reduce((acc, el) => {
      const { tickerId } = el

      if (!tickerId) {
        log.error('Cannot read tickerId from', el)
        return acc
      }

      acc[tickerId] = el

      return acc
    }, {}) as PriceAlert[]
  ).sort((a: PriceAlert, b: PriceAlert) => (a.name > b.name ? 1 : -1))
}
