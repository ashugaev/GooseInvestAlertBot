import { SHIFT_TIMEFRAMES } from '@/commands/shift'

const { set } = require('lodash')

/**
 * Нормализованные таймфреймы с оптимизацией без походу а базу
 */
export const getTimeframesObjFromStoreOrDB = async (ctx) => {
  let timeframesObj = ctx.wizard?.state?.shiftsList?.timeframesObj

  if (!timeframesObj) {
    timeframesObj = SHIFT_TIMEFRAMES

    set(ctx, 'wizard.state.shiftsList.timeframesObj', timeframesObj)
  }

  return timeframesObj
}
