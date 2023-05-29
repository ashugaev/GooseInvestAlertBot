import 'module-alias/register'
// Importing @sentry/tracing patches the global hub for tracing to work.
import '@sentry/tracing'

// Config dotenv
import * as dotenv from 'dotenv'
import * as path from 'path'

// Строка должна быть выше импорта файлов с переменными окружения
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import * as Sentry from '@sentry/node'
import OpenAPI from '@tinkoff/invest-openapi-js-sdk'
import { TinkoffInvestApi } from 'tinkoff-invest-api'

import { setupAddChat } from '@/commands/addChat/addChat'
import { addChatScenes } from '@/commands/addChat/addChat.scenes'
import { setupAdmin } from '@/commands/admin/admin'
import { setupMyToken } from '@/commands/mytoken/mytoken'
import { myTokenScenes } from '@/commands/mytoken/mytoken.scenes'
import { setupRemove } from '@/commands/remove/remove'
import { removeScenes } from '@/commands/remove/remove.scenes'
import { setupCheckers } from '@/cron'

import { setupAlert } from './commands/alert/alert'
import { alertScenes } from './commands/alert/scenes'
import { setupHelp } from './commands/help'
import { setupId } from './commands/id'
import { setupLanguage } from './commands/language'
import { setupList } from './commands/list/list'
import { setupPay } from './commands/pay/pay'
import { setupPrice } from './commands/price'
import { setupShift, shiftScenes } from './commands/shift'
import { setupStart } from './commands/start'
import { setupStat, statScenes } from './commands/stat'
import { bots } from './helpers/bot'
import { setupI18N } from './helpers/i18n'
import { log } from './helpers/log'
import { attachUser } from './middlewares/attachUser'
import { checkTime } from './middlewares/checkTime'
import { configureAnalytics } from './middlewares/configureAnalytics'
import { commonScenes } from './scenes'
const Stage = require('telegraf/stage')
const session = require('telegraf/session')

export const tinkoffApi = new TinkoffInvestApi({
  token: process.env.STOCKS_API_TOKEN,
})

const apiURL = 'https://api-invest.tinkoff.ru/openapi'
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws'
const secretToken = process.env.STOCKS_API_TOKEN

export const leagacyTinkoffApi = new OpenAPI({ apiURL, secretToken, socketURL })

Sentry.init({
  dsn: process.env.SENTRY_URL,
  // Процент транзакций, которые будут отправлены в Sentry
  tracesSampleRate: 1.0,
})

const stage = new Stage([
  statScenes,
  shiftScenes,
  removeScenes,
  myTokenScenes,
  addChatScenes,
  ...commonScenes,
  ...alertScenes,
])

export const botInit = (bot) => {
  bot.use(session())
  bot.use(stage.middleware())

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
  setupPay(bot)
  setupRemove(bot)
  setupAdmin(bot)
  setupMyToken(bot)
  setupAddChat(bot)

  // Start bot
  bot.startPolling()

  log.info(`Bot ${bot.context.goose.username} is up and running`)
}

bots.then((bots) => {
  for (const bot of bots) {
    botInit(bot)
  }

  // Start all async tasks (cron and continuous)
  setupCheckers()
})

process.on('uncaughtException', function (err) {
  log.error('[UNHANDLED]', err)
})
