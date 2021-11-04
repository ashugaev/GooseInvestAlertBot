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

export interface ITickerButtonItem {
  name: string
  symbol: string
  currency: string
}

export function setupList (bot: Telegraf<Context>) {
  bot.command('list', commandWrapper(async ctx => {
    const data = ctx.message.text.match(/list\s?(\w+)?$/)

    // Invalid Format
    if (data === null) {
      await ctx.replyWithHTML(ctx.i18n.t('alertListErrorInvalidFormat'))
      return
    }

    const forSymbol = data[1]
    let alertsList
    let uniqTickersData

    try {
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
          .markup(instrumentsListKeyboard({ page: 0, uniqTickersData }))
      )
    }
  }))

  // Управление состоянием страницы одного инструмента
  bot.action(triggerActionRegexp(Actions.list_tickerPage), alertsForInstrument)
  bot.action(triggerActionRegexp(Actions.list_editAlert), alertEdit)
  bot.action(triggerActionRegexp(Actions.list_deleteAlert), alertDelete)
  // Пагинация по списку тикеров (верхнеуровневая)
  bot.action(triggerActionRegexp(Actions.list_instrumentsPage), instrumentsListPagination)
}
