const { CronJob } = require('cron');
const { log } = require('./log');

interface StartCronJobParams {
    name: string,
    period: string,
    callback: (argsArr?: any[]) => void | Promise<void >,
    callbackArgs: any[],
    /**
     * Перед тем как делать задачу для крона выполнит callback
     */
    executeBeforeInit?: boolean,
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

    try {
        callbackArgs
            // eslint-disable-next-line prefer-spread
            ? await callback.apply(null, callbackArgs)
            : await callback();
    } catch (e) {
        log.error('Cron job error', e);
    }
  };

  executeBeforeInit && (onTickFunction())

  const job = new CronJob(
    period,
      onTickFunction,
    () => {
      log.info('Start cron job:', name);
    },
     false,
    'Europe/Moscow',
  );

  job.start();

  return job;
};
