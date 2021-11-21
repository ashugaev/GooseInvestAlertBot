import { log } from '../../helpers/log'
import { getShiftEvents } from '../../models/ShiftEvents'
import { sendStatMessage } from './statSender.utils'
import { ShiftModel } from '../../models'

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
      const shift = (await ShiftModel.find({ _id: event.createdFor }))[0]

      await sendStatMessage({
        editMessage: false,
        telegram: bot.telegram,
        data: event,
        muted: Boolean(shift?.muted)
      })
    }
  } catch (e) {
    log.error('[ShiftSender] Что-то сломалось', e)
  }
}
