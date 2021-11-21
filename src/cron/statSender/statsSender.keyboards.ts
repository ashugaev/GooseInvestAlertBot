import { Markup as m } from 'telegraf'
import { createActionString } from '../../helpers/createActionString'
import { buttonShiftDelete } from '../../commands/stat'
import { i18n } from '../../helpers/i18n'
import { Actions } from '../../constants'

export const statAlertKeyboard = (muted: boolean | undefined, id: string) => {
  const muteMessage = i18n.t('ru', 'stat_button_button_mute')
  const unmuteMessage = i18n.t('ru', 'stat_button_button_unmute')

  const buttons = [
    m.callbackButton(
      muted ? unmuteMessage : muteMessage,
      createActionString(Actions.shiftAlert_button_click, { i: id, m: !muted })
    ),
    // TODO: Прислать сообщение об отписке
    buttonShiftDelete({ id })
  ]

  return m.inlineKeyboard(buttons)
}
