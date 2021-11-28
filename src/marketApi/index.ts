import { coingeckoGetAllInstruments } from './coingecko/api/getAllInstruments'
import { tinkoffGetAllInstruments } from './tinkoff/api/getAllInstruments'
import { IBaseInstrumentData } from './types'

/**
 * Получает список всех инструментов подключенных к боту
 */
export const getAllInstruments = async (): Promise<IBaseInstrumentData[]> => {
  const allInstrumentsPromises = [
    coingeckoGetAllInstruments(),
    tinkoffGetAllInstruments()
  ]

  const allInstrumentsArr = await Promise.all(allInstrumentsPromises)

  const allInstruments = allInstrumentsArr.reduce((acc, el) => acc.concat(el), [])

  return allInstruments;
}
