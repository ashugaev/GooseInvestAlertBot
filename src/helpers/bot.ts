import { Context, Telegraf } from 'telegraf'
const TelegrafBot = require('telegraf')

export const bot = new TelegrafBot(process.env.TELEGRAM_TOKEN) as Telegraf<Context>

bot.telegram.getMe().then(botInfo => {
  const anybot = bot as any
  anybot.options.username = botInfo.username
})
