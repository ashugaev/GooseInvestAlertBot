import { Context, Markup, Telegraf } from 'telegraf'

import { Actions, Scenes } from '../../constants'
import { commandWrapper } from '../../helpers/commandWrapper'
import { log } from '../../helpers/log'
import { plur } from '../../helpers/plural'
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'
import { getShiftsForUser } from '../../models/Shifts'
import { shiftDeleteActions } from './stat.actions'
import { buttonShiftDelete } from './stat.buttons'

export function setupStat(bot: Telegraf<Context>) {
  bot.command(
    ['stats', 'stat'],
    commandWrapper({ availableForAdmins: false }, async (ctx) => {
      const { text } = ctx.message
      const { id: user } = ctx.from

      const data: string[] = text.match(/^\/(stats|stat)$/)

      if (data) {
        try {
          const shiftsForUser = await getShiftsForUser(user)

          // TODO: There is likely only one stat, so I removed the constant and hardcoded 1
          if (shiftsForUser.length >= 1) {
            // Only one shift is allowed for now
            // ctx.replyWithHTML(ctx.i18n.t('shift_overlimit', { limit: Limits.stats }))

            const { days, percent, time, timeZone, _id } = shiftsForUser[0]

            // Show the shifts the user has added
            ctx.replyWithHTML(
              ctx.i18n.t('shift_show', {
                percent,
                time: plur.hours(time + timeZone),
                days: plur.days(days),
              }),
              {
                reply_markup: Markup.inlineKeyboard([
                  buttonShiftDelete({ id: _id }),
                ]),
              }
            )

            return
          }
        } catch (e) {
          ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
          log.error(e)

          return
        }

        // @ts-ignore
        ctx.scene.enter(Scenes.shiftAdd)

        return
      }

      ctx.replyWithHTML(ctx.i18n.t('shift_invalidFormat'))
    })
  )

  bot.action(triggerActionRegexp(Actions.shift_delete), shiftDeleteActions)
}
