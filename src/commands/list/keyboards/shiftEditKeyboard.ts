import { Markup } from 'telegraf'

import { IAdditionalShiftConfig } from '@/commands/shift/shift.types'
import { shortenerCreateShort } from '@/helpers'

import { Actions } from '../../../constants'
import { createActionString } from '../../../helpers/createActionString'
import { i18n } from '../../../helpers/i18n'
import { backButton } from '../../../keyboards/backButton'
import { getShiftConfigKeyboard } from '../../shift/shift.keyboards'
import { ListActionsDataKeys } from '../list.types'
import { EKeyboardModes } from './instrumentPageKeyboard'

/**
 * Клавиатура редактирования шифта
 */
export const shiftEditKeyboard = ({ page, shiftData }) => {
  let keys = []

  const shiftConfig: IAdditionalShiftConfig = {
    muted: shiftData.muted,
    growAlerts: shiftData.growAlerts,
    fallAlerts: shiftData.fallAlerts,
    // @ts-expect-error
    [ListActionsDataKeys.selectedAlertId]: shortenerCreateShort(shiftData._id),
    p: page,
    // FIXME: Выходит за лимиты экшена
    // d: shiftData?._id,
  }

  const editKeyboard = getShiftConfigKeyboard(
    shiftConfig,
    Actions.list_shiftEditPage,
    {
      buttonsOnly: true,
    }
  )

  keys = keys.concat(editKeyboard)

  keys.push([
    Markup.callbackButton(
      i18n.t('ru', 'button_delete'),
      createActionString(Actions.list_shiftDeleteOne, {
        id: shiftData._id,
        p: page,
      })
    ),
  ])

  keys.push([
    backButton({
      action: createActionString(Actions.list_shiftsPage, {
        p: page,
        kMode: EKeyboardModes.edit,
      }),
    }),
  ])

  return keys
}
