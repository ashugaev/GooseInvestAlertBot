import { Telegraf, Context, Markup as m, Extra } from 'telegraf'
import { SHIFT_ACTIONS } from './shift.constants'
import { createActionString } from '../../helpers/createActionString'
import { i18n } from '../../helpers/i18n'

export const getTimeframesKeyboard = (timeframes) => {
  const buttons = timeframes.map(timeframe => [m.callbackButton(
    timeframe,
    createActionString(SHIFT_ACTIONS.chooseTimeframe, { timeframe })
  )])

  return m.inlineKeyboard(buttons)
}

export const getShiftConfigKeyboard = (config) => {
  const growMessage = (config.growAlerts ? '✅' : '❌') + ' ' + i18n.t('ru', 'shift_add_button_growAlert')
  const fallMessage = (config.fallAlerts ? '✅' : '❌') + ' ' + i18n.t('ru', 'shift_add_button_fallAlert')
  const mutedMessage = (config.muted ? '🔇' : '🔊') + ' ' + i18n.t('ru', 'shift_add_button_mute')

  return m.inlineKeyboard([
    [m.callbackButton(growMessage, 'kk')],
    [m.callbackButton(fallMessage, 'kk')],
    [m.callbackButton(mutedMessage, 'kk')]
  ])
}
