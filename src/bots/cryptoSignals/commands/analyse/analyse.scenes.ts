import { Context } from 'telegraf'

import {
  ANALYSE_SCENES,
  channelsPagination,
} from '@/bots/cryptoSignals/commands/analyse/analyse.constants'
import {
  generateReportByChannel,
  updateSignalChannels,
} from '@/bots/cryptoSignals/commands/analyse/analyse.utils'
import { immediateStep, waitMessageStep } from '@/scenes'

const WizardScene = require('telegraf/scenes/wizard')

/*
    Handle: -
    Ask: Канал
 */
const first = immediateStep('analyse-start-scene', async (ctx: Context) => {
  await ctx.replyWithHTML('🔄 Обновляю список каналов...')
  await updateSignalChannels()

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

const fourth = waitMessageStep(
  'analyse_scene_choose_stop_loss',
  async (ctx, text, state) => {
    state.stopLoss = text

    generateReportByChannel({
      channelInd: Number(state.channel),
      takeProfitPercent: Number(state.takeProfit),
      stopLossPercent: Number(state.stopLoss),
      ctx,
    })

    return ctx.wizard.next()
  }
)

// const chooseStopLoss = waitMessageStep(
//   'analyse_scene_choose_stop_loss',
//   (ctx) => {}
// )

export const analyseScene = new WizardScene(
  ANALYSE_SCENES.init,
  first,
  second,
  third,
  fourth
)
