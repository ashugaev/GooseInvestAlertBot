import { Context, Telegraf } from 'telegraf'

import {
  ANALYSE_SCENES,
  channelsPagination,
} from '@/bots/cryptoSignals/commands/analyse/analyse.constants'
import { commandWrapper } from '@/helpers/commandWrapper'

export function setypAnalyseChannelCommand(bot: Telegraf<Context>) {
  bot.command(
    [
      // Correct
      'analyse',
      // Incorrect
      'analyze',
      'analize',
      'analyse',
    ],
    commandWrapper(
      { availableForAdmins: true, availableForUsers: true },
      async (ctx) => {
        // @ts-ignore
        await ctx.scene.enter(ANALYSE_SCENES.init)
      }
    )
  )

  channelsPagination.initActions({
    bot,
  })

  // bot.action(
  //   triggerActionRegexp(ANALYSE_ACTIONS.channelsPagination),
  //   shiftAlertSettings
  // )
}
