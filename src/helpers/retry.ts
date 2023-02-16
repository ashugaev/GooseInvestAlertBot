/**
 * It recalls function on exception
 */
import { log } from './log'
import { wait } from './wait'

const logPrefix = '[RETRY]'

export const retry = async (func: () => Promise<any>, delay: number, funcName: string, retryTimes?: number) => {
  func().catch(
    (err) => {
      log.error(logPrefix, 'Async function crash', funcName, err)

      if (retryTimes === undefined || retryTimes > 1) {
        wait(delay).then(
          () => {
            retry(func, delay, funcName, retryTimes === undefined ? undefined : retryTimes - 1)
          }
        )
      } else {
        log.error('Retries exceeded for', funcName)
      }
    }
  )
}

export const retryForever = (func: () => Promise<any>) => {
  return retry(func, 5000, 'retryForever')
}
