import { Telegraf, Context, Markup as m, Extra } from 'telegraf'
import { SHIFT_ACTIONS } from './shift.constants'
import { createActionString } from '../../helpers/createActionString'

export const getTimeframesKeyboard = (timeframes) => {
  const buttons = timeframes.map(timeframe => [m.callbackButton(
    timeframe,
    createActionString(SHIFT_ACTIONS.chooseTimeframe, { timeframe })
  )])

  return m.inlineKeyboard(buttons)
}
