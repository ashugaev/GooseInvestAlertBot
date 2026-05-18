import { log } from '../../helpers/log'
import {
  clearCopyPriceAlerts,
  getAllAlerts,
  putItemsToCopyPriceAlerts,
} from '../../models'

/**
 * Copies all alerts into a separate collection
 */
export const copyAlerts = async () => {
  try {
    let alerts = await getAllAlerts()

    // Filter out invalid alerts stuck in the DB
    alerts = alerts.filter((el) => el.tickerId)

    if (!alerts.length) {
      log.info('No alerts to back up')
      return
    }

    await clearCopyPriceAlerts()

    await putItemsToCopyPriceAlerts(alerts)

    log.info('Alerts saved to the backup collection,', alerts.length, 'items')
  } catch (e) {
    log.error('Failed to save alerts backup', e)
  }
}
