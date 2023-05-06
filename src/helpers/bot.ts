import { Context, Telegraf } from 'telegraf'

import {BotModel} from "@/models/Bot"
const TelegrafBot = require('telegraf')

export const bots = (async () => {
  const res: Telegraf<Context>[] = [
        new TelegrafBot(process.env.TELEGRAM_TOKEN) as Telegraf<Context>
  ]
    
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
})()

export const getBot = async (id: number) => {
  const list = await bots 
    
  const bot = list.find(bot => bot.context.goose.id === id)

  if (!bot) {
    throw new Error(`Bot ${id} not found`)
  }
    
  return bot
}

