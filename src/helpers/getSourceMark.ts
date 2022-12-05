import { InstrumentsList } from '@models'

import { EMarketDataSources } from '../marketApi/types'
import { getTinkoffInstrumentLink } from './getInstrumentLInk'

const SORTENED_SOURCES: Record<EMarketDataSources, string> = {
  tinkoff: 'TNKF',
  coingecko: 'COINGECKO',
  yahoo: 'YH',
  binance: 'BINANCE'
}

// @ts-expect-error
const links: Record<EMarketDataSources, (item: InstrumentsList) => string> = {
  binance: ({ ticker }) => `https:// www.binance.com/en/trade/${ticker}`,
  tinkoff: ({ type, ticker }) => getTinkoffInstrumentLink({ type, ticker })
}

export const getSourceMark = ({ source, item }: {item?: InstrumentsList, source: EMarketDataSources}) => {
  if (!source) return null

  let res = '[' + (SORTENED_SOURCES[source] ?? source.toUpperCase()) + ']'

  if (item && links[source]?.(item)) {
    res = `<a href='${links[source](item)}'>${res}</a>`
  }

  return res
}
