
import { tinkoffApi } from '../../../app'
import { log } from '../../../helpers/log'
import { wait } from '../../../helpers/wait'
import { EMarketInstrumentTypes, InstrumentsList } from '../../../models'
import { EMarketDataSources } from '../../types'

/**
 * Замены для зашкварных тикеров валют
 */
const tickerReplacements = {
  USD000UTSTOM: 'USDRUB',
  EUR_RUB__TOM: 'EURRUB'
}

const normalizeTinkoffItem = (item): InstrumentsList => {
  const { ticker, name, type, currency, ...specificData } = item

  const result = {
    id: specificData.figi,
    source: EMarketDataSources.tinkoff,
    name,
    ticker,
    type,
    currency,
    sourceSpecificData: specificData
  }

  // Замена тикера по шаблону
  result.ticker = tickerReplacements[ticker] ?? ticker

  return result
}

export const tinkoffGetAllInstruments = async () => {
  try {
    const commonParams = {
      instrumentStatus: 'INSTRUMENT_STATUS_UNSPECIFIED'
    }

    // @ts-expect-error
    // eslint-disable-next-line max-len
    const shares = (await tinkoffApi.instruments.shares(commonParams)).instruments.map(el => ({ ...el, type: EMarketInstrumentTypes.Stock }))
    // @ts-expect-error
    // eslint-disable-next-line max-len
    const etfs = (await tinkoffApi.instruments.etfs(commonParams)).instruments.map(el => ({ ...el, type: EMarketInstrumentTypes.Etf }))
    // @ts-expect-error
    // eslint-disable-next-line max-len
    const bonds = (await tinkoffApi.instruments.bonds(commonParams)).instruments.map(el => ({ ...el, type: EMarketInstrumentTypes.Bond }))
    // @ts-expect-error
    // eslint-disable-next-line max-len
    const currencies = (await tinkoffApi.instruments.currencies(commonParams)).instruments.map(el => ({ ...el, type: EMarketInstrumentTypes.Currency }))
    // @ts-expect-error
    // eslint-disable-next-line max-len
    const futures = (await tinkoffApi.instruments.futures(commonParams)).instruments.map(el => ({ ...el, type: EMarketInstrumentTypes.Future }))

    const allInstruments = [...bonds, ...currencies, ...shares, ...etfs, ...futures]

    const normalizedInstrumentsArray = allInstruments.map(normalizeTinkoffItem)

    return normalizedInstrumentsArray
  } catch (e) {
    log.error('Ошибка получения списка иструментов:', e)

    await wait(30000)

    // Ретрай
    // eslint-disable-next-line
    return (await tinkoffGetAllInstruments())
  }
}
