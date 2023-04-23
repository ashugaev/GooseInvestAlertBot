import { log } from '../../../helpers/log'
import {TimeShift, TimeShiftModel} from '../../../models'
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
    const params: Partial<TimeShift> = { }
    if(ctx.dbuser.adminMode) {
      params.chat = ctx.adminChatActive.id
    } else {
      params.user = user
    }
    const shiftsList = await TimeShiftModel.find(params)

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
