import { Markup } from 'telegraf'

import { listConfig } from '../../../config'
import { Actions } from '../../../constants'
import { createActionString, shortenerCreateShort } from '../../../helpers'
import { getSourceMark } from '../../../helpers/getSourceMark'
import { paginationButtons } from '../../../keyboards/paginationButtons'
import { PriceAlert } from '../../../models'
import { EListTypes, ListActionsDataKeys } from '../list.types'
import { alertsTypeToggleButtons } from './alertsTypeToggleButtons'
import { EKeyboardModes } from './instrumentPageKeyboard'

/**
 * Returns a list of buttons for each instrument from the data array
 *
 * TODO: Consider merging instrumentPageKeyboard and instrumentsListKeyboard
 */
export const instrumentsListKeyboard = async ({
  uniqTickersData,
  page,
  listType = EListTypes.levels,
  user = null,
  ctx,
}) => {
  // Tickers to render on this page
  const pageTickers: PriceAlert[] = uniqTickersData.slice(
    page * listConfig.itemsPerPage,
    (Number(page) + 1) * listConfig.itemsPerPage
  )

  // Generate inline buttons per ticker
  const getTickerButtons = pageTickers.map(
    ({ name, symbol, tickerId, source }) => {
      const payload = {
        [ListActionsDataKeys.selectedTickerIdShortened]:
          shortenerCreateShort(tickerId),
        p: 0,
        tp: page,
        kMode: EKeyboardModes.edit,
      }

      const sourceMark = getSourceMark({ source }, true)

      return [
        Markup.callbackButton(
          name === symbol
            ? `${name} ${sourceMark}`
            : `${name} (${symbol}) ${sourceMark}`,
          createActionString(Actions.list_tickerPage, payload)
        ),
      ]
    }
  )

  // Build pagination buttons
  const paginatorButtons = paginationButtons({
    itemsLength: uniqTickersData.length,
    action: Actions.list_instrumentsPage,
    payload: {
      p: page,
    },
  })

  getTickerButtons.push(paginatorButtons)

  getTickerButtons.push(alertsTypeToggleButtons({ listType }))

  return Markup.inlineKeyboard(getTickerButtons)
}
