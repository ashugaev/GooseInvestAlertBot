import { createActionString } from '../../../helpers/createActionString'
import { Actions } from '../../../constants'
import { backButton } from '../../../keyboards/backButton'
import { getShiftConfigKeyboard } from '../../shift/shift.keyboards'
import { EKeyboardModes } from './instrumentPageKeyboard'

/**
 * Клавиатура редактирования шифта
 */
export const shiftEditKeyboard = ({ page, shiftData }) => {
  let keys = []

  const shiftConfig = {
    muted: shiftData.muted,
    growAlerts: shiftData.growAlerts,
    fallAlerts: shiftData.fallAlerts,
    d: shiftData._id,
    p: page
  }

  const editKeyboard = getShiftConfigKeyboard(shiftConfig, Actions.list_shiftEditPage, {
    buttonsOnly: true
  })

  keys = keys.concat(editKeyboard)

  keys.push([backButton({
    action: createActionString(Actions.list_shiftsPage, {
      p: page,
      kMode: EKeyboardModes.edit
    })
  })])

  return keys
}
