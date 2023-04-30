import { Context, Telegraf } from 'telegraf'

import {waitUntilModelIsInitialized} from "@/helpers/waitUntilModelIsInitialized"
import {BotModel} from "@/models/Bot"
const TelegrafBot = require('telegraf')

export const getBots = async () => {
  const res: Telegraf<Context>[] = [
        new TelegrafBot(process.env.TELEGRAM_TOKEN) as Telegraf<Context>
  ]
    
  await waitUntilModelIsInitialized(BotModel)
  const customBots = await BotModel.find()
    
  // Add custom bots
  for (const bot of customBots) {
    res.push(new TelegrafBot(bot.tgToken) as Telegraf<Context>)
  }
  
  // Update me info
  for(const bot of res) {
    const botInfo = await bot.telegram.getMe()
    bot.context.goose = botInfo
  }
    
  return res
}


