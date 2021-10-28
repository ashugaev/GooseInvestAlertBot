import { Telegraf, Context } from 'telegraf'
import { commandWrapper } from '../../helpers/commandWrapper'
import { SHIFT_SCENES } from './shift.constants'

export function setupShift (bot: Telegraf<Context>) {
  bot.command(['shift'], commandWrapper(async ctx => {
    ctx.scene.enter(SHIFT_SCENES.add)
  }))
}
