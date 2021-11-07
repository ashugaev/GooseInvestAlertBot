import { TimeShiftModel } from '../../../models'
import { log } from '../../../helpers/log'
import { showShiftsPage } from '../utils/showShiftsPage'
import { EKeyboardModes } from '../keyboards/instrumentPageKeyboard'

export const shiftDelete = async (ctx) => {
  try {
    const {
      id: _id,
      p: page
    } = JSON.parse(ctx.match[1])

    await TimeShiftModel.remove({ _id })

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
