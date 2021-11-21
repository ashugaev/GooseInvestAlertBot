import { Markup } from 'telegraf'
import { Actions } from '../../constants'
import { createActionString } from '../../helpers/createActionString'
import { i18n } from '../../helpers/i18n'

interface IDeleteButtonParams {
  id: string
}

export const buttonShiftDelete = ({ id }: IDeleteButtonParams) => {
  const action = createActionString(Actions.shift_delete, { id })

  return Markup.callbackButton(
    i18n.t('ru', 'button_unsubscribe'),
    action
  )
}
