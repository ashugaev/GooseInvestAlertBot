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

// Function that endlessly recalls itself on exception and returns promise
export const retryForever = async (func: () => Promise<any>) => {
  return await new Promise((resolve, reject) => {
    func().then(
      (data) => {
        resolve(data)
      }
    ).catch(
      (err) => {
        log.error(logPrefix, 'Async function crash', err)
        wait(5000)
          .then(() => {
            retryForever(func).then(
              (data) => {
                resolve(data)
              }
            ).catch(
              (err) => {
                reject(err)
              }
            )
          })
      }
    )
  })
}
