import { Markup } from 'telegraf'

import { Actions } from '../../../constants'
import { createActionString } from '../../../helpers/createActionString'
import { i18n } from '../../../helpers/i18n'
import { EListTypes } from '../list.types'

// Called "buttons" because this is part of a keyboard, not a full one
export const alertsTypeToggleButtons = ({ listType }) => {
  const isShiftsList = listType === EListTypes.shifts
  const isLevelsList = listType === EListTypes.levels

  const shiftsList = Markup.callbackButton(
    i18n.t('ru', 'alertsList_button_shifts-list', { active: isShiftsList }),
    isShiftsList
      ? // Action is a no-op in this case because we don't want to edit the message
        'null'
      : createActionString(Actions.list_shiftsPage, {
          p: 0,
        })
  )

  const alertsList = Markup.callbackButton(
    i18n.t('ru', 'alertsList_button_levels-list', { active: isLevelsList }),
    isLevelsList
      ? 'null'
      : createActionString(Actions.list_instrumentsPage, {
          p: 0,
        })
  )

  return [alertsList, shiftsList]
}
