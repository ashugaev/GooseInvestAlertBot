import { getAlerts } from '../../../models'
import { ITickerButtonItem } from '../index'

interface IFetchAlertsParams {
    forSymbol?: string,
    ctx: any,
}

/**
 *  Получение данных и запись их в контекст
 */
export const fetchAlerts = async ({ ctx, forSymbol }: IFetchAlertsParams) => {
  const alertsList = await getAlerts({ user: ctx.from.id, symbol: forSymbol })

  if (!alertsList.length) {
    await ctx.replyWithHTML(ctx.i18n.t('alertListEmpty'))

    return {
      alertsList: [],
      uniqTickersData: []
    }
  }

  // Получаем уникальные тикеры из всех алертов
  const uniqTickersData = Object.values(alertsList.reduce((acc, { name, symbol, currency }) => {
    if (acc[symbol]) return acc

    acc[symbol] = { name, symbol, currency }

    return acc
  }, {}))
    .sort((a: ITickerButtonItem, b: ITickerButtonItem) => (a.name > b.name ? 1 : -1))

  // Подкидываем состояния в констекст, что бы не делать перезапрос по нажатию на кнопки
  ctx.session.listCommand = {
    alertsList,
    uniqTickersData
  }

  return { alertsList, uniqTickersData }
}
