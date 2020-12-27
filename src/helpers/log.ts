import * as log4js from 'log4js';
import * as Sentry from "@sentry/node";

const logger = log4js.getLogger();
logger.level = 'debug';

const error = logger.error;

logger.error = (...args) => {
    Sentry.captureException(args[0]);
    error.apply(logger, args);
}

export const log = logger;
