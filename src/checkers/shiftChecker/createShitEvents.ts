import {getAllShifts} from "../../models/Shifts";
import {log} from '../../helpers/log';
import {calculateShifts} from './utils/calculateShifts';
import {createShiftEvents, ShiftEventItem, ShiftEventsModel} from "../../models/ShiftEvents";
import {getShiftsByPercent, getAllInstruments} from './utils';

export const createShitEvents = async (bot) => {
    let allInstruments = await getAllInstruments();

    const shifts = {}

    for (let i = 0; i < allInstruments.length; i++) {
        const {instruments} = allInstruments[i];

        await calculateShifts({instruments, shifts})
    }

    const shiftAlerts = await getAllShifts();

    const todayShiftEvents = shiftAlerts.reduce((acc, alert) => {
        const filteredShifts = getShiftsByPercent({percent: alert.percent, shifts: shifts[alert.days]});

        if (filteredShifts) {
            const shiftEvent: ShiftEventItem = {
                user: alert.user,
                time: alert.time,
                days: alert.days,
                targetPercent: alert.percent,
                data: getShiftsByPercent({percent: alert.percent, shifts: shifts[alert.days]})
            };

            acc.push(shiftEvent)
        }

        return acc;
    }, [])

    await ShiftEventsModel.remove({});

    await createShiftEvents(todayShiftEvents);

    log.info('Creating shift events is ready')
}
