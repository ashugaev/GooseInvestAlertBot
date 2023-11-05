import { Context, Telegraf } from 'telegraf'
import { Api, TelegramClient } from 'telegram'

import { botInit } from '@/app'
import { wait } from '@/helpers/wait'
import { signalsClient } from '@/integrations/telegram/client'
import { getBotsAndChannels } from '@/integrations/telegram/getAvailableChats'
import { BotModel } from '@/models/Bot'
import User = Api.User
import {
  SignalChat,
  SignalChatModel,
} from '@/bots/cryptoSignals/models/signalChat'
import { log } from '@/helpers/log'
import { getChatHistory } from '@/integrations/telegram/getChatHistory'
import ChannelMessages = Api.messages.ChannelMessages
import { initialSignalValidation } from '@/features/signals/devochkiChannel/handleMessage'
const TelegrafBot = require('telegraf')

// TODO: Log problems with multibot
//  Potentially it can be a limited by ip
//  Sent message to Boss
export const bots = (async () => {
  const res: Telegraf<Context>[] = [
    new TelegrafBot(process.env.TELEGRAM_TOKEN) as Telegraf<Context>,
  ]

  const customBots = await BotModel.find()

  // Add custom bots
  for (const botData of customBots) {
    const bot = new TelegrafBot(botData.tgToken) as Telegraf<Context>
    bot.context.promotedByUerId = botData.userId
    res.push(bot)
  }

  // Update me info
  for (const bot of res) {
    const botInfo = await bot.telegram.getMe()
    bot.context.goose = botInfo
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