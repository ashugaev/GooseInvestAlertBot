import { SHIFT_CONFIG } from '../../commands/stat'
import { log } from '../../helpers/log'
import { getShiftEvents, ShiftEventsModel } from '../../models/ShiftEvents'
import { i18n } from '../../helpers/i18n'
import { plur } from '../../helpers/plural'
import { getItemText } from './getItemText'

/**
 * Запускается раз в час
 * Проверяет есть ли собранная стата для юзера и присылает её ему
 */
export const shiftSender = async (bot) => {
  try {
    const weekDay = new Date().getDay()

    // TODO: Делать основываясь на изменении рынка а не дне
    // Если день в который не хотим собирать данные об изменениях
    // 6 - суббота, 0 - понедельник
    if ([6, 0].includes(weekDay)) {
      return
    }

    const hour = new Date().getHours()

    // Не отправленные статистики на сегодня за текущий час
    const events = await getShiftEvents({
      time: hour,
      // FIXME: Удалить, если будет все ок с отправкой статы
      // forDay: new Date().getDate(),
      wasSent: false
    })

    // eslint-disable-next-line no-restricted-syntax
    for (const event of events) {
      let message = i18n.t('ru', 'shift_alert_message', {
        percent: event.targetPercent,
        days: plur.days(event.days),
        itemsPerCategory: SHIFT_CONFIG.itemsPerCategory,
        // День за которые собраны данные
        dayOfWeek: event.dayOfWeek && i18n.t('ru', `days_${event.dayOfWeek}_2`)
      }) + '\n'

      const { Stock, Etf } = event.data

      Stock && (message += i18n.t('ru', 'shift_alert_message_stock', { list: Stock.map(getItemText).join('\n') }))
      Etf && (message += i18n.t('ru', 'shift_alert_message_etf', { list: Etf.map(getItemText).join('\n') }))
      // Пока убрал облигации
      // Bond && (message += i18n.t('ru', 'shift_alert_message_bond', { list: Bond.map(getItemText).join('\n') }))

      try {
        await bot.telegram.sendMessage(event.user, message, {
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      } catch (e) {
        log.error('[ShiftSender] Ошибка отправки сообщения юзеру', e)

        // TODO: Подумать как лучше делать. Может стоит отписываться от статы
        await ShiftEventsModel.update({ _id: event._id }, { $set: { wasSent: true } })
      }

      await ShiftEventsModel.update({ _id: event._id }, { $set: { wasSent: true } })
    }
  } catch (e) {
    log.error('[ShiftSender] Что-то сломалось', e)
  }
}
