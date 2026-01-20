import 'module-alias/register'
// Importing @sentry/tracing patches the global hub for tracing to work.
const TelegrafBot = require('telegraf')

// Config dotenv
import * as dotenv from 'dotenv'
import * as path from 'path'

// Строка должна быть выше импорта файлов с переменными окружения
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import OpenAPI from '@tinkoff/invest-openapi-js-sdk'
import { Context, Telegraf } from 'telegraf'
import { TinkoffInvestApi } from 'tinkoff-invest-api'

import { setypAnalyseChannelCommand } from '@/bots/cryptoSignals/commands/analyse/analyse'
import { analyseScene } from '@/bots/cryptoSignals/commands/analyse/analyse.scenes'
import { setupTradeCommand } from '@/bots/cryptoSignals/commands/trade/trade'
import {
  askNewTradeChat,
  tradeScenes,
} from '@/bots/cryptoSignals/commands/trade/trade.scenes'
import { setupAddChat } from '@/commands/addChat/addChat'
import { addChatScenes } from '@/commands/addChat/addChat.scenes'
import { setupAddPremium } from '@/commands/addPremium/addPremium'
import { premiumScenes } from '@/commands/addPremium/addPremium.scenes'
import { setupAdmin } from '@/commands/admin/admin'
import { setupMyToken } from '@/commands/mytoken/mytoken'
import { myTokenScenes } from '@/commands/mytoken/mytoken.scenes'
import { setupRemove } from '@/commands/remove/remove'
import { removeScenes } from '@/commands/remove/remove.scenes'
import { setupTest } from '@/commands/test/test'
import { botConfig } from '@/config'
import { setupCheckers } from '@/cron'

// import { setupEventHandlers } from '@/integrations/telegram/setupEventHandlers'
import { setupAlert } from './commands/alert/alert'
import { alertScenes } from './commands/alert/scenes'
import { setupHelp } from './commands/help'
import { setupId } from './commands/id'
import { setupLanguage } from './commands/language'
import { setupList } from './commands/list/list'
import { setupPay } from './commands/pay/pay'
import { setupPrice } from './commands/price'
import {
  setupShift,
  shiftScenes,
  shiftSceneUpatePercent,
} from './commands/shift'
import { setupStart } from './commands/start'
import { setupStat, statScenes } from './commands/stat'
import { bots } from './helpers/bot'
import { setupI18N } from './helpers/i18n'
import { log } from './helpers/log'
import { attachUser } from './middlewares/attachUser'
import { checkTime } from './middlewares/checkTime'
import { commonScenes } from './scenes'
const Stage = require('telegraf/stage')
const session = require('telegraf/session')

import '@/marketApi/tinkoff/api/getVolumes'

import { volumeScenes } from '@/commands/volumes/volumes.scenes'
import { subscriptionPaymentCheckerAdd } from '@/cron/subscriptionPayment/subscriptionPayment'
import { commandWrapper } from '@/helpers/commandWrapper'

export const tinkoffApi = new TinkoffInvestApi({
  token: process.env.STOCKS_API_TOKEN,
})

const apiURL = 'https://api-invest.tinkoff.ru/openapi'
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws'
const secretToken = process.env.STOCKS_API_TOKEN

export const leagacyTinkoffApi = new OpenAPI({ apiURL, secretToken, socketURL })

// Sentry.init({
//   dsn: process.env.SENTRY_URL,
//   // Процент транзакций, которые будут отправлены в Sentry
//   tracesSampleRate: 1.0,
// })

const stage = new Stage([
  tradeScenes,
  statScenes,
  shiftScenes,
  removeScenes,
  myTokenScenes,
  addChatScenes,
  shiftSceneUpatePercent,
  premiumScenes,
  volumeScenes,
  ...commonScenes,
  ...alertScenes,
])

export const botInit = (bot: Telegraf<any>) => {
  bot.use(session())
  bot.use(stage.middleware())

  // Check time
  bot.use(checkTime)
  // Attach user
  bot.use(attachUser)
  // send analytics for commands
  // bot.use(configureAnalytics)

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
  setupTest(bot)
  setupAddPremium(bot)
  // setupVolumes(bot)

  // Listen crypto transaction code
  // TODO: Move to component
  bot.hears(
    // e046c2bb63fa65a4a3d94228fd8fd87e1fb0c2ffa3780ef722846c532c326b0a
    new RegExp('^([A-Fa-f0-9]{64})$'),
    commandWrapper(
      {
        availableForAdmins: true,
        availableForUsers: true,
        bossOnly: false,
      },
      async (ctx) => {
        if (!ctx.update.message.text) return

        subscriptionPaymentCheckerAdd({
          userId: ctx.from.id,
          transactionId: ctx.update.message.text,
          ctx,
        })
      }
    )
  )

  // Start bot
  bot.startPolling()

  log.info(`Bot ${bot.context.goose.username} is up and running`)
}

if (botConfig.appFlags.priceAlertBots) {
  bots.then((bots) => {
    for (const bot of bots) {
      botInit(bot)
    }

    // Start all async tasks (cron and continuous)
    setupCheckers()
  })
}

if (botConfig.appFlags.trackSignals) {
  /**
   * Track chats feed
   */
  // retry(async () => await setupEventHandlers(), 10000, 'chat event handlers')
}

if (botConfig.appFlags.cryptoSignalBots) {
  // Start signals bot client
  // TODO: Make separated
  ;(async () => {
    const signalsStage = new Stage([
      analyseScene,
      askNewTradeChat.createScene(),
    ])

    const bot = new TelegrafBot(
      process.env.TELEGRAM_SIGNALS_BOT_TOKEN
    ) as Telegraf<Context>

    // Ignore old messages
    bot.use(checkTime)

    const botInfo = await bot.telegram.getMe()
    bot.context.goose = botInfo

    // Attach user
    // FIXME: Сейчас он слишком специфические для алерт бота
    bot.use(attachUser)

    bot.use(session())
    bot.use(signalsStage.middleware())

    setupTradeCommand(bot)
    setypAnalyseChannelCommand(bot)

    // Start bot
    bot.startPolling()
    log.info(`Bot GOOSE SIGNALS is up and running`)
  })()

  process.on('uncaughtException', function (err) {
    log.error('[UNHANDLED]', err)
  })
}
