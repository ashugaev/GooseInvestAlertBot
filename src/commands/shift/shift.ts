import { Telegraf, Context } from 'telegraf'
import { commandWrapper } from '../../helpers/commandWrapper'
import { Limits, Scenes } from '../../constants'
import { plur } from '../../helpers/plural'
import { getShiftsForUser } from '../../models/Shifts'
import { log } from '../../helpers/log'

export function setupShift (bot: Telegraf<Context>) {
  bot.command(['stats'], commandWrapper(async ctx => {
    const { text } = ctx.message
    const { id: user } = ctx.from

    const data: string[] = text.match(/^\/stats$/)

    const shiftsForUser = await getShiftsForUser(user)

    if (data) {
      try {
        if (shiftsForUser.length >= Limits.shifts) {
          // Пока доступен один шифт
          // ctx.replyWithHTML(ctx.i18n.t('shift_overlimit', { limit: Limits.shifts }))

          const { days, percent, time } = shiftsForUser[0]

          ctx.replyWithHTML(ctx.i18n.t('shift_show', {
            percent,
            time: plur.hours(time),
            days: plur.days(days)
          }))

          return
        }
      } catch (e) {
        ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
        log.error(e)

        return
      }

      ctx.scene.enter(Scenes.shiftAdd)

      return
    }

    ctx.replyWithHTML(ctx.i18n.t('shift_invalidFormat'))
  }))
}
