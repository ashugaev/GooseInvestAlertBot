import { Extra } from 'telegraf'

import { ListActionsDataKeys } from '@/commands/list/list.types'
import { shortenerGetFull } from '@/helpers'

import { log } from '../../../helpers/log'
import { removePriceAlert } from '../../../models'
import { instrumentsListKeyboard } from '../keyboards/instrumentsListKeyboard'
import { fetchAlerts } from '../utils/fetchAlerts'
import { showInstrumentPage } from '../utils/showInstrumentPage'

export const alertDelete = async (ctx) => {
  try {
    const {
      [ListActionsDataKeys.selectedAlertIdShortened]: alertIdShort,
      [ListActionsDataKeys.selectedTickerIdShortened]: tickerIdShort
    } = JSON.parse(ctx.match[1])

    const alertId = shortenerGetFull(alertIdShort)
    const instrumentId = shortenerGetFull(tickerIdShort)

    await removePriceAlert({ _id: alertId })

    // Повторный фетч для того6 что бы получить обновленный список
    const data = await fetchAlerts({ ctx })

    const instrumentItems = data.alertsList.filter(item => item.tickerId === instrumentId)

    // Если у инструмента еще остались алерты, то покажем их, если нет, то идем на список инструментов
    if (instrumentItems.length) {
      await showInstrumentPage({
        page: 0,
        instrumentItems,
        ctx,
        edit: true
      })
    } else {
      await ctx.editMessageText(ctx.i18n.t('alertList_titles', { empty: !data.uniqTickersData.length }),
        Extra
          .HTML(true)
          .markup(await instrumentsListKeyboard({ page: 0, uniqTickersData: data.uniqTickersData, ctx }))
      )
    }
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
}
