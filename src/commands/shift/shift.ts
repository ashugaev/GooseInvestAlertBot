import { Context, Telegraf } from 'telegraf'

import { commandWrapper } from '../../helpers/commandWrapper'
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'
import { shiftAlertSettings, shiftDeleteOne } from './shift.actions'
import { SHIFT_ACTIONS, SHIFT_SCENES } from './shift.constants'

export function setupShift(bot: Telegraf<Context>) {
  bot.command(
    ['shift', 's'],
    commandWrapper({ availableForAdmins: true }, async (ctx) => {
      // @ts-ignore
      await ctx.scene.enter(SHIFT_SCENES.add)
    })
  )

  bot.action(
    triggerActionRegexp(SHIFT_ACTIONS.alertSettings),
    shiftAlertSettings
  )

  bot.action(triggerActionRegexp(SHIFT_ACTIONS.deleteOne), shiftDeleteOne)
  bot.action(triggerActionRegexp(SHIFT_ACTIONS.changePercent), async (ctx) => {
    const { _id } = JSON.parse(ctx.match[1])

    // @ts-ignore
    await ctx.scene.enter(SHIFT_SCENES.updatePercent, {
      _id,
    })
  })
}
