import { Markup as m } from 'telegraf'
import { createActionString } from '../../helpers/createActionString'
import { SHIFT_ACTIONS } from '../../commands/shift'
import { i18n } from '../../helpers/i18n'

export const shiftAlertSettingsKeyboard = ({ id, isGrow }) => {
  const settingsButton = m.callbackButton(
    i18n.t('ru', 'shift_alert_buttons_settings'),
    createActionString(SHIFT_ACTIONS.alertSettings, { d: id, gr: isGrow ? 1 : 0 })
  )

  return [[settingsButton]]
}
