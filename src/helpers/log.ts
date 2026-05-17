import * as fs from 'fs'
import * as log4js from 'log4js'
import * as path from 'path'

const logsDir = path.resolve(process.cwd(), 'logs')

fs.mkdirSync(logsDir, { recursive: true })

/**
 * @fixme: Do this for NODE_EVN === 'production' only instead of my logfiles
 *    of if it's possible to do it for both
 */
log4js.configure({
  appenders: {
    logfile: {
      type: 'file',
      filename: path.join(logsDir, 'logfile.log'),
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

export const log = logger
