import { Context } from 'telegraf'

import {
  ANALYSE_SCENES,
  channelsPagination,
} from '@/bots/cryptoSignals/commands/analyse/analyse.constants'
import { updateSignalChannels } from '@/bots/cryptoSignals/commands/analyse/analyse.utils'
import { immediateStep } from '@/scenes'
import { waitButtonClickStep } from '@/scenes/wrappers'

const WizardScene = require('telegraf/scenes/wizard')
const Composer = require('telegraf/composer')

/*
    Handle: -
    Ask: Канал
 */
const startScene = immediateStep(
  'analyse-start-scene',
  async (ctx: Context) => {
    await ctx.replyWithHTML('🔄 Обновляю список каналов...')
    await updateSignalChannels()

    await channelsPagination.send(ctx, 0)

    // @ts-ignore
    return ctx.wizard.next()
  }
)

/*
    Handle: Канал
    Ask: Тейк-профит
 */
const chooseChannel = waitButtonClickStep(
  'kk',
  'analyse_scene_choose_channel',
  async (ctx) => {
    debugger
  }
)

//
// const chooseTakeProfit = waitMessageStep(
//   'analyse_scene_choose_take_profit',
//   (ctx) => {
//
//   }
// )
//
// const chooseStopLoss = waitMessageStep(
//   'analyse_scene_choose_stop_loss',
//   (ctx) => {}
// )

export const analyseScene = new WizardScene(
  ANALYSE_SCENES.init,
  startScene,
  chooseChannel
  // chooseChannel,
  // chooseTakeProfit,
  // chooseStopLoss
)
