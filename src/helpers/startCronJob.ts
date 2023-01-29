import { InitializationItem } from '../cron'
import { retry } from './retry'
import { retryUntilTrue } from './retryUntilTrue'
import { setJobKey } from './setJobKey'

const { CronJob } = require('cron')
const { log } = require('./log')

interface StartCronJobParams {
  name: string
  period: string
  callback: (argsArr?: any[]) => void | Promise<void >
  callbackArgs: any[]
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
  jobKey
}: StartCronJobParams) => {
  const onTickFunction = async () => {
    try {
      await retryUntilTrue(isReadyToStart, name)

      callbackArgs
      // eslint-disable-next-line
        ? retry(async () => {
          await callback.apply(null, callbackArgs)
          setJobKey(jobKey)
        }, 60000, 'cron job ' + name, 5)
        : retry(async () => {
          await callback()
          setJobKey(jobKey)
        }, 60000, 'cron job ' + name, 5)
    } catch (e) {
      log.error('Cron job error', e)
    }
  }

  executeBeforeInit && (onTickFunction())

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
