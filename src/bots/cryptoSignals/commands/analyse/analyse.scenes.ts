import { Context } from 'telegraf'

import {
  ANALYSE_SCENES,
  channelsPagination,
} from '@/bots/cryptoSignals/commands/analyse/analyse.constants'
import {
  generateReportByChannel,
  updateSignalChannels,
} from '@/bots/cryptoSignals/commands/analyse/analyse.utils'
import { SignalChatModel } from '@/bots/cryptoSignals/models/signalChat'
import { startAnalysisForUser } from '@/bots/cryptoSignals/models/userProcess'
import { immediateStep, waitMessageStep } from '@/scenes'

const WizardScene = require('telegraf/scenes/wizard')

/*
    Handle: -
    Ask: Канал
 */
const first = immediateStep('analyse-start-scene', async (ctx: Context) => {
  await ctx.replyWithHTML('🔄 Обновляю список каналов...')

  const channel = await SignalChatModel.findOne()

  if (
    !channel ||
    // was updated more than 1 day ago
    channel.updatedAt.getTime() < new Date().getTime() - 1000 * 60 * 60 * 24
  ) {
    await updateSignalChannels()
  }

  await channelsPagination.send(ctx, 0)

  // @ts-ignore
  return ctx.wizard.next()
})

/*
    Handle: Канал
    Ask: Тейк-профит
 */
const second = waitMessageStep(
  'analyse_scene_choose_channel',
  async (ctx, text, state) => {
    state.channel = text

    ctx.replyWithHTML(
      '🟢 Отправь мне тейк-профит в % который будет учитываться в рассчетах'
    )

    return ctx.wizard.next()
  }
)

/*
    Handle: TP
    Ask: SL
 */
const third = waitMessageStep(
  'analyse_scene_choose_take_profit',
  (ctx, text, state) => {
    state.takeProfit = text

    ctx.replyWithHTML(
      '🔴 Отправь мне стоп-лосс в % который будет учитываться в рассчетах'
    )

    return ctx.wizard.next()
  }
)

/*
    Handle: SL
    Ask: Limit
 */
const fourth = waitMessageStep(
  'analyse_scene_choose_stop_loss',
  async (ctx, text, state) => {
    state.stopLoss = text

    ctx.replyWithHTML(
      '🧮️ Сколько анализировать сигналов? Отправь 0 - если все'
    )

    return ctx.wizard.next()
  }
)

const fives = waitMessageStep(
  'analyse_scene_choose_limit',
  async (ctx, text, state) => {
    state.limit = text

    await startAnalysisForUser(ctx.from.id)

    generateReportByChannel({
      channelInd: Number(state.channel),
      takeProfitPercent: Number(state.takeProfit),
      stopLossPercent: Number(state.stopLoss),
      limitForAnalysis: Number(state.limit),
      ctx,
    })

    return ctx.scene.leave()
  }
)

export const analyseScene = new WizardScene(
  ANALYSE_SCENES.init,
  first,
  second,
  third,
  fourth,
  fives
)
