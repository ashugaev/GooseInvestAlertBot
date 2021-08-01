import { Telegraf, Context, Markup } from 'telegraf'
import { commandWrapper } from '../../helpers/commandWrapper'
import { Limits, Scenes } from '../../constants'
import { plur } from '../../helpers/plural'
import { getShiftsForUser } from '../../models/Shifts'
import { log } from '../../helpers/log'
import { buttonShiftDelete } from './shift.buttons'

export function setupShift (bot: Telegraf<Context>) {
  bot.command(['stats', 'stat'], commandWrapper(async ctx => {
    const { text } = ctx.message
    const { id: user } = ctx.from

    const data: string[] = text.match(/^\/(stats|stat)$/)

    if (data) {
      try {
        const shiftsForUser = await getShiftsForUser(user)

        if (shiftsForUser.length >= Limits.shifts) {
          // Пока доступен один шифт
          // ctx.replyWithHTML(ctx.i18n.t('shift_overlimit', { limit: Limits.shifts }))

          const { days, percent, time, timeZone, _id } = shiftsForUser[0]

          ctx.replyWithHTML(ctx.i18n.t('shift_show', {
            percent,
            time: plur.hours(time + timeZone),
            days: plur.days(days)
          }), {
            reply_markup: Markup.inlineKeyboard([buttonShiftDelete({ id: _id })])
          })

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
