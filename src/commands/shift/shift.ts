import { Telegraf, Context } from 'telegraf'
import { commandWrapper } from '../../helpers/commandWrapper'
import { Limits, Scenes } from '../../constants'
import { getShiftsCountForUser } from '../../models/Shifts'
import { log } from '../../helpers/log'

export function setupShift (bot: Telegraf<Context>) {
  bot.command(['shift'], commandWrapper(async ctx => {
    const { text } = ctx.message
    const { id: user } = ctx.from

    const data: string[] = text.match(/^\/shift$/)

    if (data) {
      try {
        if (await getShiftsCountForUser(user) >= Limits.shifts) {
          ctx.replyWithHTML(ctx.i18n.t('shift_overlimit', { limit: Limits.shifts }))
          return
        }
      } catch (e) {
        log.error(e)
      }

      ctx.scene.enter(Scenes.shiftAdd)

      return
    }

    ctx.replyWithHTML(ctx.i18n.t('shift_invalidFormat'))
  }))
}
