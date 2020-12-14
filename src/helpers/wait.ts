import { log } from './log';

export const wait = (minTime: number, maxTime?: number) => new Promise((rs) => {
  if (maxTime) {
    minTime = Math.floor(Math.random() * (maxTime - minTime) + minTime);
  }

  log.info('wait', minTime, 'milliseconds');

  setTimeout(rs, minTime);
});
