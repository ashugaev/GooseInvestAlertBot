import * as Sentry from '@sentry/node'
import * as log4js from 'log4js'
import * as process from 'process'

const logger = log4js.getLogger()
logger.level = 'debug'

const error = logger.error

logger.error = (...args) => {
  // TODO: Придумать как проставить тут id юзера
  Sentry.captureEvent({
    message: args.filter(arg => typeof arg === 'string').join(' '),
    exception: {
      values: args.filter(arg => arg instanceof Error)
    },
    user: {
      local: process.env.NODE_ENV === 'development'
    }
  })

  error.apply(logger, args)
}

export const log = logger
