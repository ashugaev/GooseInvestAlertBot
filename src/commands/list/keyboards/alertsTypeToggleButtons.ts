import { Markup } from 'telegraf'
import { createActionString } from '../../../helpers/createActionString'
import { Actions } from '../../../constants'

import { i18n } from '../../../helpers/i18n'
import { EListTypes } from '../list.types'

// Buttons потому что не цельная клава, а её часть
export const alertsTypeToggleButtons = ({ listType }) => {
  const isShiftsList = listType === EListTypes.shifts
  const isLevelsList = listType === EListTypes.levels

  const shiftsList = Markup.callbackButton(
    i18n.t('ru', 'alertsList_button_shifts-list', { active: isShiftsList }),
    isShiftsList
    // Экшен при этом условии уйдет в пустото, потому что не хотим редактировать сообщение
      ? 'null'
      : createActionString(Actions.list_instrumentsPage,
        {
          p: 0,
          t: EListTypes.shifts
        })
  )

  const alertsList = Markup.callbackButton(
    i18n.t('ru', 'alertsList_button_levels-list', { active: isLevelsList }),
    isLevelsList
      ? 'null'
      : createActionString(Actions.list_instrumentsPage,
        {
          p: 0,
          t: EListTypes.levels
        })
  )

  return [alertsList, shiftsList]
}
