const { CronJob } = require('cron');
const { log } = require('./log');

interface StartCronJobParams {
    name: string,
    period: string,
    callback: (argsArr?: any[]) => void | Promise<void >,
    callbackArgs: any[]
}

export const startCronJob = ({
  name,
  period,
  callback,
  callbackArgs,
}: StartCronJobParams) => {
  const job = new CronJob(
    period,
    async () => {
      log.info('Start cron job:', name);

      try {
        callbackArgs
          ? await callback.apply(null, callbackArgs)
          : await callback();
      } catch (e) {
        log.error('Cron job error', e);
      }
    },
    () => {
      log.info('Start cron job:', name);
    },
    false,
    'Europe/Moscow',
  );

  job.start();

  return job;
};
