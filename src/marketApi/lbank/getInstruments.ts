import { lbankRequest } from '@/marketApi/lbank/index'
import { EMarketDataSources } from '@/marketApi/types'
import { EMarketInstrumentTypes, InstrumentsList } from '@/models'

export interface LbankInstrument {
  priceAccuracy: string
  quantityAccuracy: string
  symbol: string
}

const normalizeItem = (item: LbankInstrument): InstrumentsList => {
  const { priceAccuracy, symbol } = item

  const [base, quote] = symbol.toUpperCase().split('_')

  if (!base || !quote) {
    return null
  }

  const ticker = base + quote

  const result: InstrumentsList = {
    id: `${EMarketDataSources.lbank}_${ticker}`,
    source: EMarketDataSources.lbank,
    currency: quote,
    name: ticker,
    ticker: ticker,
    type: EMarketInstrumentTypes.Crypto,
    priceScale: Number(priceAccuracy),
    sourceSpecificData: item,
  }

  return result
}

export const lbankGetInstruments = async () => {
  const {
    // @ts-ignore
    data: { data },
  } = (await lbankRequest('/v2/accuracy.do')) as unknown as LbankInstrument[]

  const normalizedInstrumentsArray = (data as LbankInstrument[])
    .map(normalizeItem)
    .filter((item) => Boolean(item))

  return normalizedInstrumentsArray
}
