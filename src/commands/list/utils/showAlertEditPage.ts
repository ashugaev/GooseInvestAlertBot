
import { set } from 'lodash'

import { alertEditKeyboard } from '@/commands/list/keyboards/alertEditKeyboard'
import { i18n } from '@/helpers/i18n'

import { getSourceMark } from '../../../helpers/getSourceMark'
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency'
import { getInstrumentByIdFromCache, PriceAlert } from '../../../models'

interface ShowAlertEditPage {
  ctx
  alert: PriceAlert
  /**
     * Send new keyboard or edit current
     */
  edit?: boolean
}

export const showAlertEditPage = async ({
  ctx,
  alert,
  edit
}: ShowAlertEditPage) => {
  const instrumentInfo = await getInstrumentByIdFromCache(alert.tickerId)

  // Проставяем id алерта для которого открыли редактирование
  set(ctx, 'session.listCommand.price.selectedAlertId', alert._id)

  const message = i18n.t('ru', 'alertsList_editOne', {
    name: alert.name,
    symbol: alert.symbol,
    growth: Boolean(alert.greaterThen),
    price: alert.lowerThen || alert.greaterThen,
    currency: symbolOrCurrency(alert.currency),
    message: alert.message,
    source: getSourceMark(instrumentInfo)
  })

  const keyboard = alertEditKeyboard({
    tickerId: alert.tickerId,
    alertId: alert._id
  })

  ctx[edit ? 'editMessageText' : 'replyWithHTML'](message, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: keyboard
    }
  })
}
