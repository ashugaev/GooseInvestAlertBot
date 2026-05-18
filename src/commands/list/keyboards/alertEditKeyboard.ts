import { Markup } from 'telegraf'

import { shortenerCreateShort } from '@/helpers'

import { Actions } from '../../../constants'
import { createActionString } from '../../../helpers/createActionString'
import { i18n } from '../../../helpers/i18n'
import { backButton } from '../../../keyboards/backButton'
import { ListActionsDataKeys } from '../list.types'
import { EKeyboardModes } from './instrumentPageKeyboard'

export const alertEditKeyboard = ({ tickerId, alertId }) => {
  const keys = []

  const deleteButton = Markup.callbackButton(
    i18n.t('ru', 'button_delete'),
    createActionString(Actions.list_deleteAlert, {
      [ListActionsDataKeys.selectedTickerIdShortened]:
        shortenerCreateShort(tickerId),
      [ListActionsDataKeys.selectedAlertIdShortened]:
        shortenerCreateShort(alertId),
    })
  )

  // FIXME: Read from the store
  const page = 0
  const tickersPage = 0

  keys.push([deleteButton])

  keys.push([
    backButton({
      action: createActionString(Actions.list_tickerPage, {
        p: page,
        kMode: EKeyboardModes.edit,
        tp: tickersPage,
        [ListActionsDataKeys.selectedTickerIdShortened]:
          shortenerCreateShort(tickerId),
      }),
    }),
  ])

  return keys
}
