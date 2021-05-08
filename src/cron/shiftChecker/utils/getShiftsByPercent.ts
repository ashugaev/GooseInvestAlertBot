import {ShiftsData} from "../../../models/ShiftEvents";

export const getShiftsByPercent = ({percent, shifts = {}}: {percent: number, shifts: ShiftsData}): ShiftsData | undefined => {
    let newShifts: null | {} = null;

    const keys = Object.keys(shifts);

    keys.forEach(key => {
        const data = shifts[key].filter(shift => {
            return shift.growPercent >= percent || shift.fallPercent >= percent
        }).sort((a, b) => b.sumVolume - a.sumVolume)
            .slice(0, 5);

        if(data.length) {
            newShifts = newShifts ?? {}
            newShifts[key] = data;
        }
    })

    return newShifts;
}
