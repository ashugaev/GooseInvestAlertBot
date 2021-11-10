import { Telegraf, Context } from 'telegraf'
import { commandWrapper } from '../../helpers/commandWrapper'
import { SHIFT_ACTIONS, SHIFT_SCENES } from './shift.constants'
import { shiftAlertSettings } from './shift.actions'
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'

export function setupShift (bot: Telegraf<Context>) {
  bot.command(['shift'], commandWrapper(async ctx => {
    ctx.scene.enter(SHIFT_SCENES.add)
  }))

  bot.action(triggerActionRegexp(SHIFT_ACTIONS.alertSettings), shiftAlertSettings)
}
