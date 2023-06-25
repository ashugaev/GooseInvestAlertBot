import { shiftsCache } from '@/cron/shiftsChecker'
import { commandWrapper } from '@/helpers/commandWrapper'

import { log } from '../../../helpers/log'
import { getTimeShifts, TimeShiftModel } from '../../../models'
import { EKeyboardModes } from '../keyboards/instrumentPageKeyboard'
import { showShiftsPage } from '../utils/showShiftsPage'

export const shiftDelete = commandWrapper(
  { availableForAdmins: true },
  async (ctx) => {
    try {
      const { id: _id, p: page } = JSON.parse(ctx.match[1])

      await TimeShiftModel.remove({ _id })
      shiftsCache.update()

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
        keyboardMode: EKeyboardModes.edit,
      })
    } catch (e) {
      ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      log.error(e)
    }
  }
)
