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
  EUR_RUB__TOM: 'EURRUB',
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
    sourceSpecificData: specificData,
    priceScale: null,
  }

  // Замена тикера по шаблону
  result.ticker = tickerReplacements[ticker] ?? ticker

  return result
}

export const tinkoffGetAllInstruments = async () => {
  try {
    const commonParams = {
      instrumentStatus: 'INSTRUMENT_STATUS_UNSPECIFIED',
    }

    const shares = // @ts-expect-error
      (await tinkoffApi.instruments.shares(commonParams)).instruments.map(
        (el) => ({ ...el, type: EMarketInstrumentTypes.Stock })
      )
    const etfs = // @ts-expect-error
      (await tinkoffApi.instruments.etfs(commonParams)).instruments.map(
        (el) => ({
          ...el,
          type: EMarketInstrumentTypes.Etf,
        })
      )
    const bonds = // @ts-expect-error
      (await tinkoffApi.instruments.bonds(commonParams)).instruments.map(
        (el) => ({ ...el, type: EMarketInstrumentTypes.Bond })
      )
    const currencies = // @ts-expect-error
      (await tinkoffApi.instruments.currencies(commonParams)).instruments.map(
        (el) => ({
          ...el,
          type: EMarketInstrumentTypes.Currency,
        })
      )

    const futures = // @ts-expect-error
      // eslint-disable-next-line max-len
      (await tinkoffApi.instruments.futures(commonParams)).instruments.map(
        (el) => ({ ...el, type: EMarketInstrumentTypes.Future })
      )

    const allInstruments = [
      ...bonds,
      ...currencies,
      ...shares,
      ...etfs,
      ...futures,
    ]

    const normalizedInstrumentsArray = allInstruments.map(normalizeTinkoffItem)

    return normalizedInstrumentsArray
  } catch (e) {
    log.error('Ошибка получения списка иструментов:', e)

    await wait(30000)

    // Ретрай
    // eslint-disable-next-line
    return await tinkoffGetAllInstruments()
  }
}
