import { get } from 'lodash'

import { showAlertEditPage } from '@/commands/list/utils/showAlertEditPage'
import { shortenerGetFull } from '@/helpers'
import { commandWrapper } from '@/helpers/commandWrapper'

import { log } from '../../../helpers/log'
import { ListActionsDataKeys } from '../list.types'

const logPrefix = '[ALERT EDIT]'

/**
 * Экшен перехода на страницу списка инструментов
 */
export const alertEdit = commandWrapper(
  { availableForAdmins: true },
  async (ctx) => {
    try {
      const {
        [ListActionsDataKeys.selectedAlertId]: selectedAlertIdShort,
        // Индекс алерта на текущей странице
        // i,
        // p: page,
        // tp: tickersPage
      } = JSON.parse(ctx.match[1])

      const selectedAlertId = shortenerGetFull(selectedAlertIdShort)

      const alertsList = get(ctx, 'session.listCommand.data.alertsList')

      const alert = alertsList.find(
        (item) => item._id.toString() === selectedAlertId
      )

      if (!alert) {
        throw new Error(logPrefix + 'Алерт не найдет')
      }

      await showAlertEditPage({
        ctx,
        alert,
        edit: true,
      })
    } catch (e) {
      ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      log.error(e)
    }
  }
)
