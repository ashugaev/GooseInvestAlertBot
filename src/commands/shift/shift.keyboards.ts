import { Markup as m } from 'telegraf'
import { SHIFT_ACTIONS } from './shift.constants'
import { createActionString } from '../../helpers/createActionString'
import { i18n } from '../../helpers/i18n'
import { IAdditionalShiftConfig } from './shift.types'

export const getTimeframesKeyboard = (timeframes) => {
  const buttons = timeframes.map(timeframe => [m.callbackButton(
    timeframe,
    createActionString(SHIFT_ACTIONS.chooseTimeframe, { timeframe })
  )])

  return m.inlineKeyboard(buttons)
}

export const getShiftConfigKeyboard = (config: IAdditionalShiftConfig) => {
  const growMessage = (config.growAlerts ? '✅' : '❌') + ' ' + i18n.t('ru', 'shift_add_button_growAlert')
  const fallMessage = (config.fallAlerts ? '✅' : '❌') + ' ' + i18n.t('ru', 'shift_add_button_fallAlert')
  const muteMessage = '🔊 ' + i18n.t('ru', 'shift_add_button_mute')
  const unmuteMessage = '🔇 ' + i18n.t('ru', 'shift_add_button_unmute')

  const growData = createActionString(SHIFT_ACTIONS.additionalConfiguration, { ...config, growAlerts: !config.growAlerts, fallAlerts: true })
  const fallData = createActionString(SHIFT_ACTIONS.additionalConfiguration, { ...config, fallAlerts: !config.fallAlerts, growAlerts: true })
  const muteData = createActionString(SHIFT_ACTIONS.additionalConfiguration, { ...config, muted: false })
  const unmuteData = createActionString(SHIFT_ACTIONS.additionalConfiguration, { ...config, muted: true })

  return m.inlineKeyboard([
    [m.callbackButton(
      growMessage,
      growData
    )],
    [m.callbackButton(
      fallMessage,
      fallData
    )],
    [
      config.muted
        ? m.callbackButton(
            unmuteMessage,
            muteData
          )
        : m.callbackButton(
          muteMessage,
          unmuteData
        )
    ]
  ])
}
