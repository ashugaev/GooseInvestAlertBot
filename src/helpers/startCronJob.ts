import { retry } from './retry';

const { CronJob } = require('cron');
const { log } = require('./log');

interface StartCronJobParams {
  name: string
  period: string
  callback: (argsArr?: any[]) => void | Promise<void >
  callbackArgs: any[]
  /**
     * Перед тем как делать задачу для крона выполнит callback
     */
  executeBeforeInit?: boolean
}

export const startCronJob = ({
  name,
  period,
  callback,
  callbackArgs,
  executeBeforeInit
}: StartCronJobParams) => {
  const onTickFunction = async () => {
    log.info('Start cron job:', name);

    // retry(async () => await setupShiftsChecker(bot), 100000, 'setupShiftsChecker');

    try {
      callbackArgs
      // eslint-disable-next-line
        ? retry(async () => await callback.apply(null, callbackArgs), 60000, 'cron job ' + name, 5)
        : retry(async () => await callback(), 60000, 'cron job ' + name, 5);
    } catch (e) {
      log.error('Cron job error', e);
    }
  };

  executeBeforeInit && (onTickFunction());

  const job = new CronJob(
    period,
    onTickFunction,
    () => {
      log.info('Start cron job:', name);
    },
    false,
    'Europe/Moscow'
  );

  job.start();

  return job;
};
