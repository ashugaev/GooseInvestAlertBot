import { commandWrapper } from '@/helpers/commandWrapper'

import { log } from '../../../helpers/log'
import { getTimeShifts } from '../../../models'
import { showShiftsPage } from '../utils/showShiftsPage'

/**
 * Страница с отслеживаниями скорости цены
 */
export const shiftsPage = commandWrapper(
  { availableForAdmins: true },
  async (ctx) => {
    try {
      const { p: page, kMode: keyboardMode } = JSON.parse(ctx.match[1])

      const { id: user } = ctx.from

      const shiftsList = await getTimeShifts({
        chat: ctx.adminChatActive?.id,
        user: user,
      })

      await showShiftsPage({
        page,
        ctx,
        shiftsList,
        edit: true,
        keyboardMode,
      })
    } catch (e) {
      ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      log.error(e)
    }
  }
)
