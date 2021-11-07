import { Telegraf, Context, Extra } from 'telegraf'
import { log } from '../../helpers/log'
import { commandWrapper } from '../../helpers/commandWrapper'
import { instrumentsListKeyboard } from './keyboards/instrumentsListKeyboard'
import { alertsForInstrument } from './actions/alertsForInstrument'
import { instrumentsListPagination } from './actions/instrumentsListPagination'
import { showInstrumentPage } from './utils/showInstrumentPage'
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'
import { Actions } from '../../constants'
import { alertEdit } from './actions/alertEdit'
import { alertDelete } from './actions/alertDelete'
import { fetchAlerts } from './utils/fetchAlerts'
import { shiftsPage } from './actions/shiftsPage'
import { shiftEditPage } from './actions/shiftEditPage'

export interface ITickerButtonItem {
  name: string
  symbol: string
  currency: string
}

export function setupList (bot: Telegraf<Context>) {
  bot.command('list', commandWrapper(async ctx => {
    const data = ctx.message.text.match(/list\s?(\w+)?$/)

    const { id: user } = ctx.from

    // Invalid Format
    if (data === null) {
      await ctx.replyWithHTML(ctx.i18n.t('alertListErrorInvalidFormat'))
      return
    }

    const forSymbol = data[1]
    let alertsList
    let uniqTickersData

    try {
      // Запишет алерты в том числе в конекст
      const data = await fetchAlerts({ ctx, forSymbol })

      alertsList = data.alertsList
      uniqTickersData = data.uniqTickersData

      if (!alertsList.length) {
        return
      }
    } catch (e) {
      log.error(e)
      return
    }

    if (forSymbol) {
      showInstrumentPage({ page: 0, symbol: forSymbol, ctx, instrumentItems: alertsList, edit: false })
    } else {
      ctx.replyWithHTML(ctx.i18n.t('alertList_titles'),
        Extra
          .HTML(true)
          .markup(await instrumentsListKeyboard({ page: 0, uniqTickersData, user }))
      )
    }
  }))

  // Управление состоянием страницы одного инструмента
  bot.action(triggerActionRegexp(Actions.list_tickerPage), alertsForInstrument)
  // Страница редактирования шифта
  bot.action(triggerActionRegexp(Actions.list_shiftEditPage), shiftEditPage)
  bot.action(triggerActionRegexp(Actions.list_editAlert), alertEdit)
  bot.action(triggerActionRegexp(Actions.list_deleteAlert), alertDelete)
  // Пагинация по списку тикеров (верхнеуровневая)
  bot.action(triggerActionRegexp(Actions.list_instrumentsPage), instrumentsListPagination)
  // Режим просмотра шифтов
  bot.action(triggerActionRegexp(Actions.list_shiftsPage), shiftsPage)
}
