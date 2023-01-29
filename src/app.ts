import 'module-alias/register'

// Config dotenv
import * as dotenv from 'dotenv'
import * as path from 'path'

// Строка должна быть выше импорта файлов с переменными окружения
// eslint-disable-next-line import/no-extraneous-dependencies
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import * as Sentry from '@sentry/node'
import OpenAPI from '@tinkoff/invest-openapi-js-sdk'
import { TinkoffInvestApi } from 'tinkoff-invest-api'

import { setupAlert } from './commands/alert/alert'
import { alertScenes } from './commands/alert/scenes'
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

export const tinkoffApi = new TinkoffInvestApi({ token: process.env.STOCKS_API_TOKEN })

const apiURL = 'https://api-invest.tinkoff.ru/openapi'
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws'
const secretToken = process.env.STOCKS_API_TOKEN

export const leagacyTinkoffApi = new OpenAPI({ apiURL, secretToken, socketURL })

Sentry.init({
  dsn: process.env.SENTRY_URL,
  tracesSampleRate: 1.0
})

const stage = new Stage([
  statScenes,
  shiftScenes,
  ...commonScenes,
  ...alertScenes
])

bot.use(session())
bot.use(stage.middleware())

// Start all async tasks (cron and continuous)
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

process.on('uncaughtException', function (err) {
  log.error('[UNHANDLED]', err)
})
