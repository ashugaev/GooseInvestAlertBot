import { SHIFT_CONFIG } from '../../../commands/shift'
import { ShiftsData } from '../../../models/ShiftEvents'

export const getShiftsByPercent = ({ percent, shifts = {} }: {percent: number, shifts: ShiftsData}): ShiftsData | undefined => {
  let newShifts = null

  const keys = Object.keys(shifts)

  keys.forEach(key => {
    const data = shifts[key].filter(shift => {
      return shift.growPercent >= percent || shift.fallPercent >= percent
    }).sort((a, b) => b.sumVolume - a.sumVolume)
    // Этот параметр должен конфигурироваться (пока изменил дефолтный с 5)
      .slice(0, SHIFT_CONFIG.itemsPerCategory)

    if (data.length) {
      newShifts = newShifts ?? {}
      newShifts[key] = data
    }
  })

  return newShifts
}
