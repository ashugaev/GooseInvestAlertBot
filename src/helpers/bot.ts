import { Context, Telegraf } from 'telegraf'
const TelegrafBot = require('telegraf')

export const bot = new TelegrafBot(process.env.TELEGRAM_TOKEN) as Telegraf<Context>

bot.telegram.getMe().then(botInfo => {
  bot.context.goose = botInfo
})
