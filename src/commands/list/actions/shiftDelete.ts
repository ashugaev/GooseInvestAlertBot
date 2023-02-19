import { shiftsCache } from '@/cron/shiftsChecker'

import { log } from '../../../helpers/log'
import { TimeShiftModel } from '../../../models'
import { EKeyboardModes } from '../keyboards/instrumentPageKeyboard'
import { showShiftsPage } from '../utils/showShiftsPage'

export const shiftDelete = async (ctx) => {
  try {
    const {
      id: _id,
      p: page
    } = JSON.parse(ctx.match[1])

    await TimeShiftModel.remove({ _id })
    shiftsCache.update()

    const { id: user } = ctx.from

    const shiftsList = await TimeShiftModel.find({ user })

    await showShiftsPage({
      page,
      ctx,
      shiftsList,
      edit: true,
      keyboardMode: EKeyboardModes.edit
    })
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
}
