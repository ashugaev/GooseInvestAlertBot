import { stocksApi } from '../../../helpers/stocksApi'
import { log } from '../../../helpers/log'
import { wait } from '../../../helpers/wait'
import { EMarketDataSources } from '../../types'
import { InstrumentsList } from '../../../models'

/**
 * Замены для зашкварных тикеров валют
  */
const tickerReplacements = {
  USD000UTSTOM: 'USDRUB',
  EUR_RUB__TOM: 'EURRUB'
}

const normalizeTinkoffItem = (item): InstrumentsList => {
  const { ticker, name, type, ...specificData } = item

  const result = {
    id: specificData.figi,
    source: EMarketDataSources.tinkoff,
    name,
    ticker,
    type,
    sourceSpecificData: specificData
  }

  // Замена тикера по шаблону
  result.ticker = tickerReplacements[ticker] ?? ticker

  return result
}

export const tinkoffGetAllInstruments = () => new Promise<any[]>(async (resolve) => {
  try {
    const allInstrumentsPromises = [
      stocksApi.stocks(),
      stocksApi.etfs(),
      stocksApi.bonds(),
      stocksApi.currencies()
    ]

    const allInstruments: any[] = await Promise.all(allInstrumentsPromises)

    const instrumentsArray = allInstruments.reduce((acc, el) => acc.concat(el.instruments), [])

    const normalizedInstrumentsArray = instrumentsArray.map(normalizeTinkoffItem)

    resolve(normalizedInstrumentsArray)
  } catch (e) {
    log.error('Ошибка получения списка иструментов:', e)

    await wait(30000)

    // Ретрай
    resolve(await tinkoffGetAllInstruments())
  }
})
