import { getShiftTimeframesObject } from '../../../models'
const { set } = require('lodash')

/**
 * Нормализованные таймфреймы с оптимизацией без походу а базу
 */
export const getTimeframesObjFromStoreOrDB = async (ctx) => {
  let timeframesObj = ctx.wizard?.state?.shiftsList?.timeframesObj

  if (!timeframesObj) {
    timeframesObj = await getShiftTimeframesObject()

    set(ctx, 'wizard.state.shiftsList.timeframesObj', timeframesObj)
  }

  return timeframesObj
}
