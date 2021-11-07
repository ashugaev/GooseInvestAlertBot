import { Markup as m } from 'telegraf'
import { SHIFT_ACTIONS } from './shift.constants'
import { createActionString } from '../../helpers/createActionString'
import { i18n } from '../../helpers/i18n'
import { IAdditionalShiftConfig } from './shift.types'
import { ShiftTimeframe } from '../../models'

export const getTimeframesKeyboard = (timeframes: ShiftTimeframe[]) => {
  const buttons = timeframes
    .sort((a, b) => a.lifetime - b.lifetime)
    .map(timeframe => [m.callbackButton(
      timeframe.name_ru,
      createActionString(SHIFT_ACTIONS.chooseTimeframe, { timeframe: timeframe.timeframe })
    )])

  return m.inlineKeyboard(buttons)
}

export const getShiftConfigKeyboard = (payload: IAdditionalShiftConfig, action: string, { buttonsOnly = false } = {}) => {
  const growMessage = (payload.growAlerts ? '✅' : '❌') + ' ' + i18n.t('ru', 'shift_add_button_growAlert')
  const fallMessage = (payload.fallAlerts ? '✅' : '❌') + ' ' + i18n.t('ru', 'shift_add_button_fallAlert')
  const muteMessage = '🔊 ' + i18n.t('ru', 'shift_add_button_mute')
  const unmuteMessage = '🔇 ' + i18n.t('ru', 'shift_add_button_unmute')

  const payloadCopy = {
    m: payload.muted ? 1 : 0,
    g: payload.growAlerts ? 1 : 0,
    f: payload.fallAlerts ? 1 : 0,
    ...payload
  }

  // Выпиливаю старые/длинные названия
  delete payloadCopy.growAlerts
  delete payloadCopy.fallAlerts
  delete payloadCopy.muted

  const growData = createActionString(action, {
    ...payloadCopy,
    g: payload.growAlerts ? 0 : 1,
    f: 1
  })
  const fallData = createActionString(action, {
    ...payloadCopy,
    f: payload.fallAlerts ? 0 : 1,
    g: 1
  })
  const muteData = createActionString(action, {
    ...payloadCopy,
    m: 0
  })
  const unmuteData = createActionString(action, {
    ...payloadCopy,
    m: 1
  })

  const buttons = [
    [m.callbackButton(
      growMessage,
      growData
    )],
    [m.callbackButton(
      fallMessage,
      fallData
    )],
    [
      payload.muted
        ? m.callbackButton(
            unmuteMessage,
            muteData
          )
        : m.callbackButton(
          muteMessage,
          unmuteData
        )
    ]
  ]

  return buttonsOnly ? buttons : m.inlineKeyboard(buttons)
}
