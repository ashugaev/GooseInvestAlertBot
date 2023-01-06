import { InitializationItem } from '../cron'
import { retry } from './retry'
import { setJobKey } from './setJobKey'
import { wait } from './wait'

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
    while (!isReadyToStart?.() ?? false) {
      // Waiting untill all preparation for this job will be done
      await wait(1000)
    }

    log.info('Start cron job:', name)

    try {
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
