import 'module-alias/register'

// Config dotenv
import * as dotenv from 'dotenv'
import * as path from 'path'

// This line must precede imports of files that read environment variables.
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { Context, Telegraf } from 'telegraf'
import { TinkoffInvestApi } from 'tinkoff-invest-api'

import { setupAddChat } from '@/commands/addChat/addChat'
import { addChatScenes } from '@/commands/addChat/addChat.scenes'
import { setupAddPremium } from '@/commands/addPremium/addPremium'
import { premiumScenes } from '@/commands/addPremium/addPremium.scenes'
import { setupAdmin } from '@/commands/admin/admin'
import { setupBroadcast } from '@/commands/broadcast/broadcast'
import { broadcastScenes } from '@/commands/broadcast/broadcast.scenes'
import { setupMyToken } from '@/commands/mytoken/mytoken'
import { myTokenScenes } from '@/commands/mytoken/mytoken.scenes'
import { setupRemove } from '@/commands/remove/remove'
import { removeScenes } from '@/commands/remove/remove.scenes'
import { setupTest } from '@/commands/test/test'
import { botConfig } from '@/config'
import { setupCheckers } from '@/cron'

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
import { shutdownMode } from './middlewares/shutdownMode'
import { commonScenes } from './scenes'
const Stage = require('telegraf/stage')
const session = require('telegraf/session')

import { subscriptionPaymentCheckerAdd } from '@/cron/subscriptionPayment/subscriptionPayment'
import { waitForMongoConnectionOrCrash } from '@/db/mongoose'
import { commandWrapper } from '@/helpers/commandWrapper'

export const tinkoffApi = new TinkoffInvestApi({
  token: process.env.STOCKS_API_TOKEN,
})

const stage = new Stage([
  statScenes,
  shiftScenes,
  removeScenes,
  myTokenScenes,
  addChatScenes,
  shiftSceneUpatePercent,
  premiumScenes,
  broadcastScenes,
  ...commonScenes,
  ...alertScenes,
])

export const botInit = (bot: Telegraf<Context>) => {
  // Kill switch: must run before session/stage so it can short-circuit every update.
  bot.use(shutdownMode)

  bot.use(session())
  bot.use(stage.middleware())

  // Check time
  bot.use(checkTime)
  // Attach user
  bot.use(attachUser)

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
  setupBroadcast(bot)

  // Listen for crypto transaction hashes (subscription payments via TRX/USDT).
  bot.hears(
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
  bots.then(async (bots) => {
    await waitForMongoConnectionOrCrash('app bootstrap')
    for (const bot of bots) {
      botInit(bot)
    }

    // Start all async tasks (cron and continuous)
    setupCheckers()
  })
}
