import * as Sentry from '@sentry/node'
import * as log4js from 'log4js'

const logger = log4js.getLogger()
logger.level = 'debug'

const error = logger.error

logger.error = (...args) => {
  // TODO: Придумать как проставить тут id юзера
  Sentry.captureException(args[0])

  error.apply(logger, args)
}

export const log = logger
