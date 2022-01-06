import { Markup } from 'telegraf'
import { createActionString } from '../../../helpers/createActionString'
import { Actions } from '../../../constants'
import { backButton } from '../../../keyboards/backButton'
import { i18n } from '../../../helpers/i18n'
import { EKeyboardModes } from './instrumentPageKeyboard'

export const alertEditKeyboard = ({ idI, symbol, page, tickersPage }) => {
  const keys = []

  const deleteButton = Markup.callbackButton(
    i18n.t('ru', 'button_delete'),
    createActionString(Actions.list_deleteAlert, { idI, s: symbol })
  )

  keys.push([deleteButton])

  keys.push([backButton({
    action: createActionString(Actions.list_tickerPage, {
      s: symbol, p: page, kMode: EKeyboardModes.edit, tp: tickersPage
    })
  })])

  return keys
}
