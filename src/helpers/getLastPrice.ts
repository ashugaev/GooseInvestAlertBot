import { getLastPriceFromCache } from '../modules'

/**
 * Вернет цену по id
 */
export const getLastPrice = async (id: string) => {
  if (!id) {
    throw new Error('Необходимо предоставить id для получения последней цены')
  }

  const lastPrice = await getLastPriceFromCache(id)

  if (!lastPrice) {
    throw new Error('Не была получена последняя цена инструмента ' + id)
  }

  return lastPrice
}
