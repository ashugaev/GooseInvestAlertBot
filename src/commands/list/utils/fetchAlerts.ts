import { set } from 'lodash'

import { log } from '../../../helpers/log'
import { PriceAlert, PriceAlertModel } from '../../../models'

interface IFetchAlertsParams {
  tickerId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any
  noContextUpdate?: boolean
  ticker?: string
}

interface FetchAlertsResult {
  alertsList: PriceAlert[]
  uniqTickersData: PriceAlert[]
}

/**
 * Fetch the user's active alerts and store them in the context
 */
export const fetchAlerts = async ({
  ctx,
  tickerId,
  noContextUpdate,
  ticker,
}: IFetchAlertsParams): Promise<FetchAlertsResult> => {
  const params: Partial<PriceAlert> = {
    triggered: false,
    removed: false,
    botId: ctx.goose.id,
  }

  if (ctx.dbuser.adminMode) {
    params.chat = ctx.adminChatActive.id
  } else {
    params.user = ctx.dbuser.id
  }

  if (tickerId) {
    params.tickerId = tickerId
  }

  // FIXME: finish text search in alerts for list command filters
  if (ticker?.length) {
    params.symbol = ticker.toUpperCase()
  }

  const alerts = await PriceAlertModel.find(params).lean()

  if (!alerts.length) {
    return {
      alertsList: [],
      uniqTickersData: [],
    }
  }

  // Get the unique tickers from all alerts
  // The name is no longer fully accurate because we group by id, not by ticker
  const uniqTickersData: PriceAlert[] = Object.values(
    alerts.reduce((acc, el) => {
      const { tickerId } = el

      if (!tickerId) {
        log.error('Cannot read tickerId from', el)
        return acc
      }

      acc[tickerId] = el

      return acc
    }, {}) as PriceAlert[]
  ).sort((a: PriceAlert, b: PriceAlert) => (a.name > b.name ? 1 : -1))

  // TODO: Remove context storage so that everything still works after a redeploy
  if (!noContextUpdate) {
    // Stash state in context to avoid re-querying on button clicks
    set(ctx, 'session.listCommand.data', {
      alertsList: alerts,
      uniqTickersData,
    })
  }

  return { alertsList: alerts, uniqTickersData }
}
