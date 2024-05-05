import * as Sentry from '@sentry/node'
import * as log4js from 'log4js'
import * as process from 'process'

/**
 * @fixme: Do this for NODE_EVN === 'production' only instead of my logfiles
 *    of if it's possible to do it for both
 */
log4js.configure({
  appenders: {
    logfile: {
      type: 'file',
      filename: 'logs/logfile.log',
      maxLogSize: 10 * 1024 * 1024, // 10MB
      backups: 10,
    },
    console: { type: 'console' },
  },
  categories: {
    default: { appenders: ['logfile', 'console'], level: 'debug' },
  },
})

const logger = log4js.getLogger()
logger.level = 'debug'

const error = logger.error

logger.error = (...args) => {
  // TODO: Придумать как проставить тут id юзера
  Sentry.captureEvent({
    message: args.filter((arg) => typeof arg === 'string').join(' '),
    exception: {
      values: args.filter((arg) => arg instanceof Error),
    },
    user: {
      local: process.env.NODE_ENV === 'development',
    },
  })

  error.apply(logger, args)
}

export const log = logger
