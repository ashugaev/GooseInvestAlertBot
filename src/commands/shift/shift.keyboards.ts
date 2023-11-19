import { Markup as m } from 'telegraf'

import { createActionString } from '../../helpers/createActionString'
import { i18n } from '../../helpers/i18n'
import { SHIFT_ACTIONS, ShiftTimeframe } from './shift.constants'
import { IAdditionalShiftConfig } from './shift.types'

export const getTimeframesKeyboard = (timeframes: ShiftTimeframe[]) => {
  const list = [...timeframes.sort((a, b) => a.lifetime - b.lifetime)]
  const buttons = []

  while (list.length) {
    const row = []

    const firstEl = list.shift()
    const secondEl = list.shift()

    if (firstEl) {
      row.push(
        m.callbackButton(
          firstEl.name_ru,
          createActionString(SHIFT_ACTIONS.chooseTimeframe, {
            timeframe: firstEl.timeframe,
          })
        )
      )
    }
    if (secondEl) {
      row.push(
        m.callbackButton(
          secondEl.name_ru,
          createActionString(SHIFT_ACTIONS.chooseTimeframe, {
            timeframe: secondEl.timeframe,
          })
        )
      )
    }

    buttons.push(row)
  }

  return m.inlineKeyboard(buttons)
}

export const getShiftConfigKeyboard = (
  payload: IAdditionalShiftConfig,
  action: string,
  { buttonsOnly = false } = {}
) => {
  const growMessage =
    (payload.growAlerts ? '✅' : '❌') +
    ' ' +
    i18n.t('ru', 'shift_add_button_growAlert')
  const fallMessage =
    (payload.fallAlerts ? '✅' : '❌') +
    ' ' +
    i18n.t('ru', 'shift_add_button_fallAlert')
  const muteMessage = '🔊 ' + i18n.t('ru', 'shift_add_button_mute')
  const unmuteMessage = '🔇 ' + i18n.t('ru', 'shift_add_button_unmute')

  const payloadCopy = {
    m: payload.muted ? 1 : 0,
    g: payload.growAlerts ? 1 : 0,
    f: payload.fallAlerts ? 1 : 0,
    ...payload,
  }

  // Выпиливаю старые/длинные названия
  delete payloadCopy.growAlerts
  delete payloadCopy.fallAlerts
  delete payloadCopy.muted

  const growData = createActionString(action, {
    ...payloadCopy,
    g: payload.growAlerts ? 0 : 1,
    f: 1,
  })
  const fallData = createActionString(action, {
    ...payloadCopy,
    f: payload.fallAlerts ? 0 : 1,
    g: 1,
  })
  const muteData = createActionString(action, {
    ...payloadCopy,
    m: 0,
  })
  const unmuteData = createActionString(action, {
    ...payloadCopy,
    m: 1,
  })

  const buttons = [
    [m.callbackButton(growMessage, growData)],
    [m.callbackButton(fallMessage, fallData)],
    [
      payload.muted
        ? m.callbackButton(unmuteMessage, muteData)
        : m.callbackButton(muteMessage, unmuteData),
    ],
  ]

  // Иногда нет Id из-за лимитов экшена. Это нешится при переходе на стов в базе или шортификатор
  if (payload.d) {
    buttons.push(
      [
        m.callbackButton(
          i18n.t('ru', 'shift_add_button_changePercent'),
          createActionString(SHIFT_ACTIONS.changePercent, {
            _id: payload.d,
          })
        ),
      ],
      [
        m.callbackButton(
          i18n.t('ru', 'button_delete'),
          createActionString(SHIFT_ACTIONS.deleteOne, { id: payload.d })
        ),
      ]
    )
  }

  return buttonsOnly ? buttons : m.inlineKeyboard(buttons)
}
