import { Context, Extra, Telegraf } from 'telegraf'

import { EKeyboardModes } from '@/commands/list/keyboards/instrumentPageKeyboard'
import { showInstrumentPage } from '@/commands/list/utils/showInstrumentPage'
import { getTimeShifts, TimeShift } from '@/models'

import { Actions } from '../../constants'
import { commandWrapper } from '../../helpers/commandWrapper'
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'
import { alertDelete } from './actions/alertDelete'
import { alertEdit } from './actions/alertEdit'
import { alertsForInstrument } from './actions/alertsForInstrument'
import { instrumentsListPagination } from './actions/instrumentsListPagination'
import { shiftDelete } from './actions/shiftDelete'
import { shiftEditPage } from './actions/shiftEditPage'
import { shiftsPage } from './actions/shiftsPage'
import { instrumentsListKeyboard } from './keyboards/instrumentsListKeyboard'
import { fetchAlerts } from './utils/fetchAlerts'
import { showShiftsPage } from './utils/showShiftsPage'

export function setupList(bot: Telegraf<Context>) {
  bot.command(
    'list',
    // @ts-ignore
    commandWrapper({ availableForAdmins: true }, async (ctx) => {
      const data = ctx.message.text.match(/list\s?(\w+)?$/)

      const { id: user } = ctx.from

      // Invalid Format
      if (data === null) {
        await ctx.replyWithHTML(ctx.i18n.t('alertListErrorInvalidFormat'))
        return
      }

      const [, tickerName] = data

      // Default command context values
      ctx.session.listCommand = {
        price: {
          tickersPage: 0,
          tickerAlertsPage: 0,
          selectedTickerId: null,
          selectedAlertId: null,
        },
        shifts: {
          page: 0,
        },
        data: {
          alertsList: [],
          uniqTickersData: [],
        },
      }

      // Fetch all user alerts and store them in the context
      const { alertsList, uniqTickersData } = await fetchAlerts({
        ctx,
        ticker: tickerName,
      })

      // If there are any alerts
      if (uniqTickersData.length) {
        // If alerts belong to a single instrument, show it directly
        if (uniqTickersData.length === 1) {
          // Show the only alert
          return await showInstrumentPage({
            page: 0,
            ctx,
            instrumentItems: alertsList,
            edit: false,
            keyboardMode: EKeyboardModes.edit,
            tickersPage: 0,
          })
        }

        if (uniqTickersData.length > 1) {
          // TODO: Create ShowTickersList for this reply
          return ctx.replyWithHTML(
            ctx.i18n.t('alertList_titles', { empty: !uniqTickersData.length }),
            Extra.HTML(true).markup(
              await instrumentsListKeyboard({
                page: 0,
                uniqTickersData,
                user,
                ctx,
              })
            )
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
        ...shiftsParams,
      })

      // Always show this page, even if it is empty
      return await showShiftsPage({ ctx, page: 0, edit: false, shiftsList })
    })
  )

  // Single-instrument page state management
  bot.action(triggerActionRegexp(Actions.list_tickerPage), alertsForInstrument)
  // Shift edit page
  bot.action(triggerActionRegexp(Actions.list_shiftEditPage), shiftEditPage)
  // Delete shift
  bot.action(triggerActionRegexp(Actions.list_shiftDeleteOne), shiftDelete)
  bot.action(triggerActionRegexp(Actions.list_editAlert), alertEdit)
  bot.action(triggerActionRegexp(Actions.list_deleteAlert), alertDelete)
  // Top-level pagination over the tickers list
  bot.action(
    triggerActionRegexp(Actions.list_instrumentsPage),
    instrumentsListPagination
  )
  // Shifts view mode
  bot.action(triggerActionRegexp(Actions.list_shiftsPage), shiftsPage)
}
