import { ShiftEventsModel } from '../../models/ShiftEvents'
import { i18n } from '../../helpers/i18n'
import { plur } from '../../helpers/plural'
import { SHIFT_CONFIG } from '../../commands/stat'
import { getItemText } from './getItemText'
import { log } from '../../helpers/log'
import { statAlertKeyboard } from './statsSender.keyboards'

export const sendStatMessage = async ({ telegram, data, editMessage, muted }) => {
  let message = i18n.t('ru', 'shift_alert_message', {
    percent: data.targetPercent,
    days: plur.days(data.days),
    itemsPerCategory: SHIFT_CONFIG.itemsPerCategory,
    // День за которые собраны данные
    dayOfWeek: data.dayOfWeek && i18n.t('ru', `days_${data.dayOfWeek}_2`)
  }) + '\n'

  const { Stock, Etf } = data.data

  Stock && (message += i18n.t('ru', 'shift_alert_message_stock', { list: Stock.map(getItemText).join('\n') }))
  Etf && (message += i18n.t('ru', 'shift_alert_message_etf', { list: Etf.map(getItemText).join('\n') }))
  // Пока убрал облигации
  // Bond && (message += i18n.t('ru', 'shift_alert_message_bond', { list: Bond.map(getItemText).join('\n') }))

  try {
    await telegram[editMessage ? 'editMessageText' : 'sendMessage'](data.user, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: statAlertKeyboard(
        muted,
        data._id
      )
    })
  } catch (e) {
    log.error('[ShiftSender] Ошибка отправки сообщения юзеру', e)

    // TODO: Подумать как лучше делать. Может стоит отписываться от статы
    !editMessage && await ShiftEventsModel.update({ _id: data._id }, { $set: { wasSent: true } })
  }

  !editMessage && await ShiftEventsModel.update({ _id: data._id }, { $set: { wasSent: true } })
}
