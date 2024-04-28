import { Context, Telegraf } from 'telegraf'

import { VOLUME_SCENES } from '@/commands/volumes/volumes.constants'
import { commandWrapper } from '@/helpers/commandWrapper'

export function setupVolumes(bot: Telegraf<Context>) {
  bot.command(
    ['volume', 'v', 'volumes'],
    commandWrapper({ availableForAdmins: true }, async (ctx) => {
      // @ts-ignore
      await ctx.scene.enter(VOLUME_SCENES.add)
    })
  )

  // bot.action(
  //   triggerActionRegexp(SHIFT_ACTIONS.alertSettings),
  //   shiftAlertSettings
  // )
  //
  // bot.action(triggerActionRegexp(SHIFT_ACTIONS.deleteOne), shiftDeleteOne)
  // bot.action(triggerActionRegexp(SHIFT_ACTIONS.changePercent), async (ctx) => {
  //   const { _id } = JSON.parse(ctx.match[1])
  //
  //   // @ts-ignore
  //   await ctx.scene.enter(SHIFT_SCENES.updatePercent, {
  //     _id,
  //   })
  // })
}
