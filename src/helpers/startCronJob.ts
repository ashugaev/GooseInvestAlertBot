import { isMongoReady } from '@/db/mongoose'

import { InitializationItem } from '../cron'
import { retry } from './retry'
import { retryUntilTrue } from './retryUntilTrue'
import { setJobKey } from './setJobKey'

const { CronJob } = require('cron')
const { log } = require('./log')

interface StartCronJobParams {
  name: string
  period: string
  callback: (...args: unknown[]) => void | Promise<void>
  callbackArgs?: unknown[]
  /**
   * Перед тем как делать задачу для крона выполнит callback
   */
  executeBeforeInit?: boolean
  isReadyToStart?: () => boolean
  jobKey?: InitializationItem
}

export const startCronJob = ({
  name,
  period,
  callback,
  callbackArgs,
  executeBeforeInit,
  isReadyToStart,
  jobKey,
}: StartCronJobParams) => {
  const onTickFunction = async () => {
    try {
      await retryUntilTrue(
        () => (isReadyToStart ? isReadyToStart() : true) && isMongoReady(),
        name
      )

      retry(
        async () => {
          if (callbackArgs?.length) {
            await callback(...callbackArgs)
          } else {
            await callback()
          }

          setJobKey(jobKey)
        },
        60000,
        'cron job ' + name,
        5
      )
    } catch (e) {
      log.error('Cron job error', e)
    }
  }

  executeBeforeInit && onTickFunction()

  const job = new CronJob(
    period,
    onTickFunction,
    () => {
      log.info('Start cron job:', name)
    },
    false,
    'Europe/Moscow'
  )

  job.start()

  return job
}
