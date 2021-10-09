import { log } from '../../helpers/log'
import { EMarketDataSources } from '../../marketApi/types'
import { getInstrumentsBySource } from '../../models'
import { createShiftEvents, ShiftEventItem, ShiftEventsModel } from '../../models/ShiftEvents'
import { getAllShifts } from '../../models/Shifts'
import { getShiftsByPercent } from './utils'
import { calculateShifts } from './utils/calculateShifts'

export const createShitEvents = async (bot) => {
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
        data: filteredShifts
      }

      acc.push(shiftEvent)
    }

    return acc
  }, [])

  try {
    await ShiftEventsModel.remove({})

    await createShiftEvents(todayShiftEvents)
  } catch (e) {
    log.error('[ShiftEvents] Ошибка обновления данных в базе', e)

    return
  }

  log.info('Creating shift events is ready')
}
