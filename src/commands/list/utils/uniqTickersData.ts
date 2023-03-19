// Получаем уникальные тикеры из всех алертов
// Название уже не совсем корректное, потому что группируем по id а не по тикеру
import { log } from '@/helpers'
import { PriceAlert } from '@/models'

export const getUniqTickersData = (alerts: PriceAlert[]): PriceAlert[] => {
  return Object.values(alerts.reduce((acc, el) => {
    const { tickerId } = el

    if (!tickerId) {
      log.error('Не могу получить tickerId у', el)
      return acc
    }

    acc[tickerId] = el

    return acc
  }, {}) as PriceAlert[])
    .sort((a: PriceAlert, b: PriceAlert) => (a.name > b.name ? 1 : -1))
}
