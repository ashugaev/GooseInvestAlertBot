import { log } from '../../../helpers/log'
import { TimeShiftModel } from '../../../models'
import { showShiftsPage } from '../utils/showShiftsPage'

/**
 * Страница с отслеживаниями скорости цены
 */
export const shiftsPage = async (ctx) => {
  try {
    const {
      p: page,
      kMode: keyboardMode
    } = JSON.parse(ctx.match[1])

    const { id: user } = ctx.from

    const shiftsList = await TimeShiftModel.find({ user })

    await showShiftsPage({
      page,
      ctx,
      shiftsList,
      edit: true,
      keyboardMode
    })
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
}
