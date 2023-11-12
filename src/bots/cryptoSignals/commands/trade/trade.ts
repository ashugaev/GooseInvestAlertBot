import { Context, Telegraf } from 'telegraf'

import { askNewTradeChat } from '@/bots/cryptoSignals/commands/trade/trade.scenes'
import { commandWrapper } from '@/helpers/commandWrapper'
import { immediateStep } from '@/scenes'

const WizardScene = require('telegraf/scenes/wizard')

const testStep = immediateStep('sendjj token', async (ctx) => {
  console.log('kkkk')
  debugger
  return ctx.scene.leave()
})

export const testScene = new WizardScene('test111', testStep)

export function setupTradeCommand(bot: Telegraf<Context>) {
  bot.command(
    ['trade'],
    commandWrapper(
      {
        availableForAdmins: true,
        availableForUsers: true,
        bossOnly: true,
      },
      async (ctx) => {
        askNewTradeChat.startScene(ctx)
        // @ts-ignore
        // await askNewTradeChat.startScene(ctx)
      }
    )
  )

  // askNewTradeChat.init({ bot })
}
