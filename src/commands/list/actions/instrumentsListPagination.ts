import { set } from 'lodash'
import { Extra } from 'telegraf'

import { log } from '../../../helpers/log'
import { instrumentsListKeyboard } from '../keyboards/instrumentsListKeyboard'

export const instrumentsListPagination = async (ctx) => {
  try {
    const {
      p: page = 0
    } = JSON.parse(ctx.match[1])

    set(ctx, 'session.listCommand.price.tickersPage', page)

    const { id: user } = ctx.from

    const alertsList = ctx.session?.listCommand?.data?.alertsList
    const uniqTickersData = ctx.session?.listCommand?.data?.uniqTickersData

    await ctx.editMessageText(ctx.i18n.t('alertList_titles', { empty: !uniqTickersData.length }),
      Extra
        .HTML(true)
        .markup(await instrumentsListKeyboard({
          page, uniqTickersData, user, ctx
        }))
    )
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
}
