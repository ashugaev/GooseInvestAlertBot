import { InstrumentsList } from '../models'
import { getLastPriceFromCache } from '../modules'

export interface IGetInfoBySymbolParams {
  /**
   * id тикера по которому получим данные
   */
  id: string
  /**
   * Вспомогательные необязательные данные, что бы не делать допзапрос для их получения
   */
  instrumentData?: InstrumentsList
}

/**
 * Вернет цену по id
 */
export const getLastPrice = async ({
  id
}: IGetInfoBySymbolParams) => {
  if (!id) {
    throw new Error('Необходимо предоставить id либо ticker для получения последней цены')
  }

  const lastPrice = await getLastPriceFromCache(id)

  if (!lastPrice) {
    throw new Error('Не была получена последняя цена инструмента ' + id)
  }

  return lastPrice
}
