import { Telegraf, Context, Markup } from 'telegraf'
import { commandWrapper } from '../../helpers/commandWrapper'
import { Actions, Scenes } from '../../constants'
import { plur } from '../../helpers/plural'
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'
import { getShiftsForUser } from '../../models/Shifts'
import { log } from '../../helpers/log'
import { shiftDeleteActions } from './stat.actions'
import { buttonShiftDelete } from './stat.buttons'

export function setupStat (bot: Telegraf<Context>) {
  bot.command(['stats', 'stat'], commandWrapper(async ctx => {
    const { text } = ctx.message
    const { id: user } = ctx.from

    const data: string[] = text.match(/^\/(stats|stat)$/)

    if (data) {
      try {
        const shiftsForUser = await getShiftsForUser(user)

        // TODO: Вероятно стата будет только одна, по этому убрал из константы и захардкодил 1
        if (shiftsForUser.length >= 1) {
          // Пока доступен один шифт
          // ctx.replyWithHTML(ctx.i18n.t('shift_overlimit', { limit: Limits.stats }))

          const { days, percent, time, timeZone, _id } = shiftsForUser[0]

          // Показать шифты, которые у юзара добавлены
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

  bot.action(triggerActionRegexp(Actions.shift_delete), shiftDeleteActions)
}
