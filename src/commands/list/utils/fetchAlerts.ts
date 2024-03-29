import { set } from 'lodash'

import { log } from '../../../helpers/log'
import { getAlerts } from '../../../models'
import { ITickerButtonItem } from '../index'

interface IFetchAlertsParams {
  tickerId?: string
  ctx: any
  noContextUpdate?: boolean
}

/**
 *  Получение алертов юзера и запись их в контекст
 */
export const fetchAlerts = async ({ ctx, tickerId, noContextUpdate }: IFetchAlertsParams) => {
  const alertsList = await getAlerts({ user: ctx.from.id, tickerId })

  if (!alertsList.length) {
    return {
      alertsList: [],
      uniqTickersData: []
    }
  }

  // Получаем уникальные тикеры из всех алертов
  // Название уже не совсем корректное, потому что группируем по id а не по тикеру
  const uniqTickersData = Object.values(alertsList.reduce((acc, el) => {
    const { tickerId } = el

    if (!tickerId) {
      log.error('Не могу получить tickerId у', el)
      return acc
    }

    acc[tickerId] = el

    return acc
  }, {}))
    .sort((a: ITickerButtonItem, b: ITickerButtonItem) => (a.name > b.name ? 1 : -1))

  // TODO: Избавиться от хранения в контексте, что бы все работало после передеплоя
  if (!noContextUpdate) {
  // Подкидываем состояния в констекст, что бы не делать перезапрос по нажатию на кнопки
    set(ctx, 'session.listCommand.data', {
      alertsList,
      uniqTickersData
    })
  }

  return { alertsList, uniqTickersData }
}
