// Config dotenv
import * as dotenv from 'dotenv'

// Строка должна быть выше импорта файлов с переменными окружения
// eslint-disable-next-line import/no-extraneous-dependencies
dotenv.config({ path: `${__dirname}/../.env` })

import * as Sentry from '@sentry/node'

import { bot } from './helpers/bot'
import { log } from './helpers/log'
import { setupI18N } from './helpers/i18n'

import { checkTime } from './middlewares/checkTime'
import { attachUser } from './middlewares/attachUser'
import { setupHelp } from './commands/help'
import { setupStart } from './commands/start'
import { setupAlert } from './commands/alert'
import { setupStat, statScenes } from './commands/stat'
import { setupShift, shiftScenes } from './commands/shift'
import { setupLanguage } from './commands/language'
import { setupList } from './commands/list'
import { setupPrice } from './commands/price'

import { alertAddMessageScene } from './scenes/alertAddMessageScene'
import { alertAddScene } from './scenes/alertAddScene'

import { configureAnalytics } from './middlewares/configureAnalytics'
import { setupCheckers } from './cron'

const Stage = require('telegraf/stage')
const session = require('telegraf/session')

Sentry.init({
  dsn: process.env.SENTRY_URL,
  tracesSampleRate: 1.0
})

const stage = new Stage([
  alertAddMessageScene,
  alertAddScene,
  statScenes,
  shiftScenes
])

bot.use(session())
bot.use(stage.middleware())

// Start checking stocks prices and alerting
setupCheckers(bot)

// Check time
bot.use(checkTime)
// Attach user
bot.use(attachUser)
// send analytics for commands
bot.use(configureAnalytics)

// Setup localization
setupI18N(bot)
// Setup commands
setupHelp(bot)
setupAlert(bot)
setupList(bot)
setupLanguage(bot)
setupPrice(bot)
setupStart(bot)
setupShift(bot)
setupStat(bot)

// Start bot
bot.startPolling()

log.info('Bot is up and running')
