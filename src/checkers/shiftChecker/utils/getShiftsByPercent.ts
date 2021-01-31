import {ShiftsData} from "../../../models/ShiftEvents";

export const getShiftsByPercent = ({percent, shifts = {}}: {percent: number, shifts: ShiftsData}): ShiftsData | undefined => {
    let newShifts: null | {} = null;

    const keys = Object.keys(shifts);

    keys.forEach(key => {
        const data = shifts[key].filter(shift => {
            return shift.growPercent >= percent || shift.fallPercent >= percent
        });

        if(data.length) {
            newShifts = newShifts ?? {}
            newShifts[key] = data;
        }
    })

    return newShifts;
}
