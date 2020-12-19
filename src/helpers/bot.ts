// Dependencies
import { Context, Telegraf } from 'telegraf'
import TelegrafBot from 'telegraf'

export const bot = new TelegrafBot(process.env.TELEGRAM_TOKEN) as Telegraf<Context>

bot.telegram.getMe().then(botInfo => {
  const anybot = bot as any
  anybot.options.username = botInfo.username
})
