import {Context, Extra, Telegraf} from 'telegraf'

import {EKeyboardModes} from '@/commands/list/keyboards/instrumentPageKeyboard'
import {showInstrumentPage} from '@/commands/list/utils/showInstrumentPage'
import {getTimeShifts, TimeShift, TimeShiftModel} from '@/models'

import {Actions} from '../../constants'
import {commandWrapper} from '../../helpers/commandWrapper'
import {triggerActionRegexp} from '../../helpers/triggerActionRegexp'
import {alertDelete} from './actions/alertDelete'
import {alertEdit} from './actions/alertEdit'
import {alertsForInstrument} from './actions/alertsForInstrument'
import {instrumentsListPagination} from './actions/instrumentsListPagination'
import {shiftDelete} from './actions/shiftDelete'
import {shiftEditPage} from './actions/shiftEditPage'
import {shiftsPage} from './actions/shiftsPage'
import {instrumentsListKeyboard} from './keyboards/instrumentsListKeyboard'
import {fetchAlerts} from './utils/fetchAlerts'
import {showShiftsPage} from './utils/showShiftsPage'

export function setupList(bot: Telegraf<Context>) {
  // @ts-ignore
  bot.command('list', commandWrapper({availableForAdmins: true}, async ctx => {
    const data = ctx.message.text.match(/list\s?(\w+)?$/)

    const {id: user} = ctx.from

    // Invalid Format
    if (data === null) {
      await ctx.replyWithHTML(ctx.i18n.t('alertListErrorInvalidFormat'))
      return
    }

    const [, tickerName] = data

    // Дефолтные значения констекста для команды
    ctx.session.listCommand = {
      price: {
        tickersPage: 0,
        tickerAlertsPage: 0,
        selectedTickerId: null,
        selectedAlertId: null
      },
      shifts: {
        page: 0
      },
      data: {
        alertsList: [],
        uniqTickersData: []
      }
    }

    // Вернет все алерты юзера и запишет в контекст
    const {alertsList, uniqTickersData} = await fetchAlerts({ctx, ticker: tickerName})

    // Если есть алерты
    if (uniqTickersData.length) {
      // Если алерты одного инструмента то показываем сразу его
      if (uniqTickersData.length === 1) {
        // Если алерт один, то показываем его
        return await showInstrumentPage({
          page: 0,
          ctx,
          instrumentItems: alertsList,
          edit: false,
          keyboardMode: EKeyboardModes.edit,
          tickersPage: 0
        })
      }

      if (uniqTickersData.length > 1) {
        // TODO: Создать ShowTickersList для этого reply
        return ctx.replyWithHTML(ctx.i18n.t('alertList_titles', {empty: !uniqTickersData.length}),
          Extra
            .HTML(true)
            .markup(await instrumentsListKeyboard({
              page: 0,
              uniqTickersData,
              user,
              ctx
            }))
        )
      }
    }

    const shiftsParams: Partial<TimeShift> = {}

    if (tickerName) {
      shiftsParams.ticker = tickerName.toUpperCase()
    }

    const shiftsList = await getTimeShifts({
      chat: ctx.adminChatActive?.id,
      user: user,
      ...shiftsParams
    })

    // В любом случае показываем эту страницу, даже есои она пустая
    return await showShiftsPage({ctx, page: 0, edit: false, shiftsList})
  }))

  // Управление состоянием страницы одного инструмента
  bot.action(triggerActionRegexp(Actions.list_tickerPage), alertsForInstrument)
  // Страница редактирования шифта
  bot.action(triggerActionRegexp(Actions.list_shiftEditPage), shiftEditPage)
  // Удалить шифт
  bot.action(triggerActionRegexp(Actions.list_shiftDeleteOne), shiftDelete)
  bot.action(triggerActionRegexp(Actions.list_editAlert), alertEdit)
  bot.action(triggerActionRegexp(Actions.list_deleteAlert), alertDelete)
  // Пагинация по списку тикеров (верхнеуровневая)
  bot.action(triggerActionRegexp(Actions.list_instrumentsPage), instrumentsListPagination)
  // Режим просмотра шифтов
  bot.action(triggerActionRegexp(Actions.list_shiftsPage), shiftsPage)
}
