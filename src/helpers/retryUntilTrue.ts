import { appInitStatuses } from '../cron'
import { log } from './log'
import { wait } from './wait'

const logPrefix = '[RETRY UNTIL TRUE]'

/**
 * Retries callback every second
 */
export const retryUntilTrue = async (callback, callbackName) => {
  log.info(logPrefix, 'Waiting to start:', callbackName)
  log.info('init statuses array', appInitStatuses)

  while (callback ? !callback() : false) {
    // Waiting untill all preparation for this job will be done
    log.info(logPrefix, 'Retry:', callbackName)
    log.info('init statuses array', appInitStatuses)

    await wait(1000)
  }

  log.info(logPrefix, 'Started:', callbackName)
}
