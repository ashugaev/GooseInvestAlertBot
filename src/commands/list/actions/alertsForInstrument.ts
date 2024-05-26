import { set } from 'lodash'

import { shortenerGetFull } from '@/helpers'
import { commandWrapper } from '@/helpers/commandWrapper'
import { alertByTickerIdFromCache } from '@/models'

import { log } from '../../../helpers/log'
import { ListActionsDataKeys } from '../list.types'
import { showInstrumentPage } from '../utils/showInstrumentPage'

/**
 * Экшен перехода на страницу списка инструментов
 *
 * Страницы для ценового уровня
 */
export const alertsForInstrument = commandWrapper(
  { availableForAdmins: true },
  async (ctx) => {
    try {
      const {
        [ListActionsDataKeys.selectedTickerIdShortened]:
          selectedTickerIdShortened,
        p: page,
        kMode: keyboardMode,
        tp: tickersPage,
      } = JSON.parse(ctx.match[1])

      const selectedTickerId = shortenerGetFull(selectedTickerIdShortened)

      set(ctx, 'session.listCommand.price.selectedTickerId', selectedTickerId)

      const alerts = await alertByTickerIdFromCache(
        selectedTickerId,
        ctx.from.id,
        ctx.dbuser.adminModeChatId,
        ctx
      )

      await showInstrumentPage({
        page,
        ctx,
        instrumentItems: alerts,
        edit: true,
        keyboardMode,
        tickersPage,
        noRedirectToEditPage: true,
      })
    } catch (e) {
      ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      log.error(e)
    }
  }
)
