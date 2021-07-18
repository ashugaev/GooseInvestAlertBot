import { log } from '../../helpers/log';
import { EMarketDataSources } from "../../marketApi/types";
import { getInstrumentsBySource } from "../../models";
import { createShiftEvents, ShiftEventItem, ShiftEventsModel } from "../../models/ShiftEvents";
import { getAllShifts } from "../../models/Shifts";
import { getShiftsByPercent } from './utils';
import { calculateShifts } from './utils/calculateShifts';

export const createShitEvents = async (bot) => {
    let instruments = null;

    try {
        // Зафетчили акции/облигации/фонды массивом
        instruments = await getInstrumentsBySource({source: EMarketDataSources.tinkoff});
    } catch (e) {
        log.error('Ошибка получения инструментов из tinkoff', e);

        // Тут поидее должен быть ретрай
    }

    const shifts = {}

    // Считаем изменение цены за каждый день для каждого инструмента и кладем все в shifts
    await calculateShifts({instruments, shifts})

    // Получаем все подписки на шифты из базы
    const shiftAlerts = await getAllShifts();

    log.info('User alerts', shiftAlerts.length);

    const todayShiftEvents = shiftAlerts.reduce((acc, alert) => {
        // Получаем шифты отсеянные по проценту и отсортированные по объему + обрезка
        const filteredShifts = getShiftsByPercent({percent: alert.percent, shifts: shifts[alert.days]});

        if (filteredShifts) {
            const shiftEvent: ShiftEventItem = {
                user: alert.user,
                time: alert.time,
                days: alert.days,
                targetPercent: alert.percent,
                data: filteredShifts
            };

            acc.push(shiftEvent)
        }

        return acc;
    }, [])

    await ShiftEventsModel.remove({});

    await createShiftEvents(todayShiftEvents);

    log.info('Creating shift events is ready')
}
