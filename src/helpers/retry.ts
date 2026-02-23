/**
 * It recalls function on exception
 */
import { waitForMongoConnection } from '@/db/mongoose'

import { log } from './log'
import { wait } from './wait'

const logPrefix = '[RETRY]'

const isMongoError = (error: unknown) => {
  const parsedError = error as Partial<Error>
  const name = typeof parsedError?.name === 'string' ? parsedError.name : ''
  const message =
    typeof parsedError?.message === 'string'
      ? parsedError.message
      : String(error || '')

  return /mongo|mongoose|buffering timed out|server selection|topology|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(
    `${name} ${message}`
  )
}

export const retry = async (
  func: () => Promise<unknown>,
  delay: number,
  funcName?: string,
  retryTimes?: number
) => {
  func().catch(async (error) => {
    log.error(logPrefix, 'Async function crash', funcName, error)

    if (isMongoError(error)) {
      await waitForMongoConnection(funcName || 'retry callback')
    }

    if (retryTimes === undefined || retryTimes > 1) {
      await wait(delay)
      retry(
        func,
        delay,
        funcName,
        retryTimes === undefined ? undefined : retryTimes - 1
      )
    } else {
      log.error('Retries exceeded for', funcName)
    }
  })
}

// Function that endlessly recalls itself on exception and returns promise
export const retryForever = async <T>(
  callback: () => Promise<T>
): Promise<T> => {
  while (true) {
    try {
      const result = await callback()
      return result
    } catch (error) {
      log.error(logPrefix, 'Async function crash', error)

      if (isMongoError(error)) {
        await waitForMongoConnection('retryForever')
      } else {
        await wait(10000)
      }
    }
  }
}
