import { stocksApi } from '../../../helpers/stocksApi'
import { log } from '../../../helpers/log'
import { wait } from '../../../helpers/wait'
import { EMarketDataSources, EMarketInstrumentTypes, IBaseInstrumentData } from '../../types'

const normalizeTinkoffItem = (item): IBaseInstrumentData => {
  const { ticker, name, type, ...specificData } = item

  return {
    source: EMarketDataSources.tinkoff,
    name,
    ticker,
    type,
    sourceSpecificData: specificData
  }
}

export const tinkoffGetAllInstruments = () => new Promise<any[]>(async (rs) => {
  try {
    const allInstrumentsPromises = [
      stocksApi.stocks(),
      stocksApi.etfs(),
      stocksApi.bonds()
    ]

    const allInstruments:any[] = await Promise.all(allInstrumentsPromises)

    const instrumentsArray = allInstruments.reduce((acc, el) => acc.concat(el.instruments), [])

    const normalizedInstrumentsArray = instrumentsArray.map(normalizeTinkoffItem)

    rs(normalizedInstrumentsArray)
  } catch (e) {
    log.error('Ошибка получения списка иструментов:', e)

    await wait(30000)

    // Ретрай
    rs(await tinkoffGetAllInstruments())
  }
})
