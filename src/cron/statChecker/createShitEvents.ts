import { log } from '../../helpers/log'
import { EMarketDataSources } from '../../marketApi/types'
import { getInstrumentsBySource } from '../../models'
import { createShiftEvents, ShiftEventItem, ShiftEventsModel } from '../../models/ShiftEvents'
import { getAllShifts } from '../../models/Shifts'
import { getShiftsByPercent } from './utils'
import { calculateShifts } from './utils/calculateShifts'

export const createShitEvents = async (bot) => {
  // WARN: Полагается на то, что начало сбора данных произошло в день за который собираем данные
  const weekDay = new Date().getDay()

  // TODO: Делать основываясь на изменении рынка а не дне
  // Если день в который не хотим собирать данные об изменениях
  // 6 - суббота, 0 - понедельник
  if ([6, 0].includes(weekDay)) {
    return
  }

  let instruments = null

  try {
    // Зафетчили акции/облигации/фонды массивом из базы
    instruments = await getInstrumentsBySource({ source: EMarketDataSources.tinkoff })
  } catch (e) {
    log.error('Ошибка получения списка инструментов из базы для шифтов', e)

    // Тут поидее должен быть ретрай
    return
  }

  const shifts = {}

  // Считаем изменение цены за каждый день для каждого инструмента и кладем все в shifts
  await calculateShifts({ instruments, shifts })

  let shiftAlerts = []

  try {
    // Получаем все подписки на шифты из базы
    shiftAlerts = await getAllShifts()
  } catch (e) {
    log.error(e)

    return
  }

  log.info('User alerts', shiftAlerts.length)

  // Смотрим какие алерты стриггерились
  const todayShiftEvents = shiftAlerts.reduce((acc, alert) => {
    // Получаем шифты отсеянные по проценту и отсортированные по объему + обрезка
    const filteredShifts = getShiftsByPercent({ percent: alert.percent, shifts: shifts[alert.days] })

    if (filteredShifts) {
      const shiftEvent: ShiftEventItem = {
        user: alert.user,
        time: alert.time,
        days: alert.days,
        targetPercent: alert.percent,
        forDay: new Date().getDate(),
        data: filteredShifts,
        wasSent: false,
        dayOfWeek: weekDay
      }

      acc.push(shiftEvent)
    }

    return acc
  }, [])

  try {
    // TODO: Присылать алерты только если были изменения в ценах
    //  для этого можно заюзать утилиту checksum и делать проверку по хэшу

    // Удаляем алерты за это число месяца (подразумевается предыдущий месяц)
    await ShiftEventsModel.remove({
      forDay: new Date().getDate()
    })

    await createShiftEvents(todayShiftEvents)
  } catch (e) {
    log.error('[ShiftEvents] Ошибка обновления данных в базе', e)

    return
  }

  log.info('Creating shift events is ready')
}
