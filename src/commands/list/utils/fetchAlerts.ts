import { set } from 'lodash'

import { log } from '../../../helpers/log'
import { PriceAlert, PriceAlertModel } from '../../../models'

interface IFetchAlertsParams {
  tickerId?: string
  ctx: any
  noContextUpdate?: boolean
  ticker?: string
}

interface FetchAlertsResult {
  alertsList: PriceAlert[]
  uniqTickersData: PriceAlert[]
}

/**
 *  Получение алертов юзера и запись их в контекст
 *
 *  @todo Refactor. Separate uniq tickers and alerts list
 *  @deprecated Use PriceAlertModel.find() instead
 */
export const fetchAlerts = async (
  { ctx, tickerId, noContextUpdate, ticker }: IFetchAlertsParams
): Promise<FetchAlertsResult> => {
  const params: Partial<PriceAlert> = {}

  if(ctx.dbuser.adminMode) {
    params.chat = ctx.adminChatActive?.id
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
      uniqTickersData: []
    }
  }

  // Получаем уникальные тикеры из всех алертов
  // Название уже не совсем корректное, потому что группируем по id а не по тикеру
  const uniqTickersData: PriceAlert[] = Object.values(alerts.reduce((acc, el) => {
    const { tickerId } = el

    if (!tickerId) {
      log.error('Не могу получить tickerId у', el)
      return acc
    }

    acc[tickerId] = el

    return acc
  }, {}) as PriceAlert[])
    .sort((a: PriceAlert, b: PriceAlert) => (a.name > b.name ? 1 : -1))

  // TODO: Избавиться от хранения в контексте, что бы все работало после передеплоя
  if (!noContextUpdate) {
  // Подкидываем состояния в констекст, что бы не делать перезапрос по нажатию на кнопки
    set(ctx, 'session.listCommand.data', {
      alertsList: alerts,
      uniqTickersData
    })
  }

  return { alertsList: alerts, uniqTickersData }
}
