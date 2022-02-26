import { Extra } from 'telegraf'
import { instrumentsListKeyboard } from '../keyboards/instrumentsListKeyboard'
import { EListTypes } from '../list.types'
import { log } from '../../../helpers/log'

/**
 * Экшен перехода на страницу списка инструментов
 *
 * Эта страница актуальная только для ценовых уровней
 */
export const instrumentsListPagination = async (ctx) => {
  try {
    const {
      p: page = 0
      // type списка
    } = JSON.parse(ctx.match[1])

    const { id: user } = ctx.from

    const alertsList = ctx.session?.listCommand?.data?.alertsList
    const uniqTickersData = ctx.session?.listCommand?.data?.uniqTickersData

    if (!alertsList?.length) {
      await ctx.editMessageText(ctx.i18n.t('unrecognizedError'))

      return
    }

    await ctx.editMessageText(ctx.i18n.t('alertList_titles'),
      Extra
        .HTML(true)
        .markup(await instrumentsListKeyboard({
          page, uniqTickersData, user
        }))
    )
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
}
