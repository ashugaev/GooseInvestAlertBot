import { log } from './log'
import { wait } from './wait'

const logPrefix = '[RETRY UNTIL TRUE]'

/**
 * Retries callback every second untill isReady will return true
 */
export const retryUntilTrue = async (
  isReady: () => boolean,
  callbackName?: string
) => {
  log.info(logPrefix, 'Waiting to start:', callbackName)

  while (isReady ? !isReady() : false) {
    await wait(1000)
  }

  log.info(logPrefix, 'Started:', callbackName)
}
