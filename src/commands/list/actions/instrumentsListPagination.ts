import { Extra } from 'telegraf'
import { instrumentsListKeyboard } from '../keyboards/instrumentsListKeyboard'
import { EListTypes } from '../list.types'
import { log } from '../../../helpers/log'

/**
 * Экшен перехода на страницу списка инструментов
 * @param ctx
 */
export const instrumentsListPagination = async (ctx) => {
  try {
    const {
      p: page = 0,
      // type списка
      t: listType = EListTypes.shifts
    } = JSON.parse(ctx.match[1])

    const { id: user } = ctx.from

    const alertsList = ctx.session?.listCommand?.alertsList
    const uniqTickersData = ctx.session?.listCommand?.uniqTickersData

    if (!alertsList?.length) {
      ctx.editMessageText(ctx.i18n.t('unrecognizedError'))

      return
    }

    ctx.editMessageText(ctx.i18n.t('alertList_titles'),
      Extra
        .HTML(true)
        .markup(await instrumentsListKeyboard({
          page, uniqTickersData, listType, user
        }))
    )
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
}
