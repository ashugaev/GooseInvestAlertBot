import { Extra } from 'telegraf'

import { ListActionsDataKeys } from '@/commands/list/list.types'
import { getUniqTickersData } from '@/commands/list/utils/uniqTickersData'
import { shortenerGetFull } from '@/helpers'
import { commandWrapper } from '@/helpers/commandWrapper'

import { log } from '../../../helpers/log'
import { priceAlertCache, removePriceAlert } from '../../../models'
import { instrumentsListKeyboard } from '../keyboards/instrumentsListKeyboard'
import { showInstrumentPage } from '../utils/showInstrumentPage'

export const alertDelete = commandWrapper(
  { availableForAdmins: true },
  async (ctx) => {
    try {
      const {
        [ListActionsDataKeys.selectedAlertIdShortened]: alertIdShort,
        [ListActionsDataKeys.selectedTickerIdShortened]: tickerIdShort,
        [ListActionsDataKeys.selectedAlertPage]: alertPage,
        [ListActionsDataKeys.tickersListPage]: tickerPage,
      } = JSON.parse(ctx.match[1])

      const alertId = shortenerGetFull(alertIdShort)
      const instrumentId = shortenerGetFull(tickerIdShort)

      await removePriceAlert({ _id: alertId, removed: true })
      priceAlertCache.removeItemFromCache(alertId)

      const alerts = ctx.dbuser.adminMode
        ? priceAlertCache.getForChat(ctx.dbuser.adminModeChatId)
        : priceAlertCache.getForUser(ctx.from.id)

      const instrumentItems = alerts.filter(
        (item) => item.tickerId === instrumentId
      )

      const uniqTickersData = getUniqTickersData(alerts)

      // Если у инструмента еще остались алерты, то покажем их, если нет, то идем на список инструментов
      if (instrumentItems.length) {
        await showInstrumentPage({
          page: alertPage ?? 0,
          instrumentItems,
          ctx,
          edit: true,
        })
      } else {
        await ctx.editMessageText(
          ctx.i18n.t('alertList_titles', { empty: !uniqTickersData.length }),
          Extra.HTML(true).markup(
            await instrumentsListKeyboard({
              page: tickerPage ?? 0,
              uniqTickersData,
              ctx,
            })
          )
        )
      }
    } catch (e) {
      ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      log.error(e)
    }
  }
)
