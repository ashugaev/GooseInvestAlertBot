import { Context, Telegraf } from 'telegraf'
import { Api } from 'telegram'

import { botInit } from '@/app'
import { BotModel } from '@/models/Bot'
import User = Api.User

import { log } from '@/helpers/log'
import ChannelMessages = Api.messages.ChannelMessages
const TelegrafBot = require('telegraf')

// TODO: Log problems with multibot
//  Potentially it can be a limited by ip
//  Sent message to Boss
export const bots = (async () => {
  const res: Telegraf<Context>[] = [
    new TelegrafBot(process.env.TELEGRAM_TOKEN) as Telegraf<Context>,
  ]

  try {
    const botInf = await res[0].telegram.getMe()
    res[0].context.goose = botInf
  } catch (e) {
    log.error('Bot error', e)
  }

  const customBots = await BotModel.find()

  // Add custom bots
  for (const botData of customBots) {
    const bot = new TelegrafBot(botData.tgToken) as Telegraf<Context>
    bot.context.promotedByUerId = botData.userId

    try {
      const botInfo = await bot.telegram.getMe()
      bot.context.goose = botInfo

      res.push(bot)
    } catch (e) {
      if (e.code === 401) {
        // Deactivate bot here. It means token not valid
      }
      log.error('Bot error', e)
      continue
    }
  }

  return res
})()

export const getBot = async (id: number) => {
  const list = await bots

  const bot = list.find((bot) => bot.context.goose.id === id)

  if (!bot) {
    throw new Error(`Bot ${id} not found`)
  }

  return bot
}

export const getBotByUserId = async (userId) => {
  const list = await bots

  const bot = list.find((bot) => bot.context.promotedByUerId === userId)

  return bot
}

export const deployBot = async (
  ctx: Context,
  tgToken
): Promise<{ error?: string; bot?: Telegraf<Context> }> => {
  const bot = new TelegrafBot(tgToken) as Telegraf<Context>

  let error = ''
  const list = await bots

  try {
    const botInfo = await bot.telegram.getMe()
    bot.context.goose = botInfo
    bot.context.promotedByUerId = ctx.from.id
    if (list.some((item) => item.context.goose.username === botInfo.username)) {
      error = 'Already deployed'
    }
  } catch (e) {
    error = e?.message ?? ''
  }

  if (error.length) {
    return {
      error,
    }
  }

  botInit(bot)

  list.push(bot)

  await BotModel.insertMany({
    userId: ctx.from.id,
    tgToken,
  })

  return { bot }
}

export const killBot = async (botId: number, ctx: Context) => {
  await BotModel.deleteMany({
    userId: ctx.from.id,
  })

  const bot = await getBotByUserId(ctx.from.id)

  bot.stop()
}
