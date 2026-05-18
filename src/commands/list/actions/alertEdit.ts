import { get } from 'lodash'

import { showAlertEditPage } from '@/commands/list/utils/showAlertEditPage'
import { shortenerGetFull } from '@/helpers'
import { commandWrapper } from '@/helpers/commandWrapper'

import { log } from '../../../helpers/log'
import { ListActionsDataKeys } from '../list.types'

const logPrefix = '[ALERT EDIT]'

/**
 * Action to navigate to the instruments list page
 */
export const alertEdit = commandWrapper(
  { availableForAdmins: true },
  async (ctx) => {
    try {
      const {
        [ListActionsDataKeys.selectedAlertId]: selectedAlertIdShort,
        // Index of the alert on the current page
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
        throw new Error(logPrefix + 'Alert not found')
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
