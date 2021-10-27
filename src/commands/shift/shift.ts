import { Telegraf, Context } from 'telegraf'
import { commandWrapper } from '../../helpers/commandWrapper'
// import { Actions, Scenes } from '../../constants'
// import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'
// import { shiftDeleteActions } from './stat.actions'
import { SHIFT_SCENES } from './shift.constants'

export function setupShift (bot: Telegraf<Context>) {
  bot.command(['shift'], commandWrapper(async ctx => {
    ctx.scene.enter(SHIFT_SCENES.add)
  }))

  // bot.action(triggerActionRegexp(Actions.shift_delete), shiftDeleteActions)
}
