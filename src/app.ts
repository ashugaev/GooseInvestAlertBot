import 'module-alias/register'

// Config dotenv
import * as dotenv from 'dotenv'

// Строка должна быть выше импорта файлов с переменными окружения
// eslint-disable-next-line import/no-extraneous-dependencies
dotenv.config({ path: `${__dirname}/../.env` })

import * as Sentry from '@sentry/node'

import { setupAlert } from './commands/alert/alert'
import { alertAddMessageScene } from './commands/alert/scenes/alertAddMessageScene'
import { alertAddScene } from './commands/alert/scenes/alertAddScene'
import { askAlertPriceScene } from './commands/alert/scenes/askAlertPriceScene'
import { askAlertTickerScene } from './commands/alert/scenes/askAlertTickerScene'
import { setupHelp } from './commands/help'
import { setupId } from './commands/id'
import { setupLanguage } from './commands/language'
import { setupList } from './commands/list'
import { setupPrice } from './commands/price'
import { setupShift, shiftScenes } from './commands/shift'
import { setupStart } from './commands/start'
import { setupStat, statScenes } from './commands/stat'
import { setupCheckers } from './cron'
import { bot } from './helpers/bot'
import { setupI18N } from './helpers/i18n'
import { log } from './helpers/log'
import { attachUser } from './middlewares/attachUser'
import { checkTime } from './middlewares/checkTime'
import { configureAnalytics } from './middlewares/configureAnalytics'
import { commonScenes } from './scenes'

const Stage = require('telegraf/stage')
const session = require('telegraf/session')

Sentry.init({
  dsn: process.env.SENTRY_URL,
  tracesSampleRate: 1.0
})

const stage = new Stage([
  // alert
  askAlertPriceScene,
  askAlertTickerScene,
  alertAddMessageScene,
  alertAddScene,
  // stat
  statScenes,
  // shift
  shiftScenes,
  ...commonScenes
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
setupId(bot)

// Start bot
bot.startPolling()

log.info('Bot is up and running')
