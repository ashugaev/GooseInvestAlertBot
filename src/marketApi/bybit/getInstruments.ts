import { SymbolInfo } from 'bybit-api'

import { log } from '@/helpers/log'
import { EMarketDataSources } from '@/marketApi/types'
import { EMarketInstrumentTypes, InstrumentsList } from '@/models'

import { wait } from '../../helpers/wait'
import { byBitApi } from './api'

const logPrefix = '[BYBIT GET ALL INSTRUMENTS]'

const normalizeItem = (item: SymbolInfo): InstrumentsList => {
  const { alias, name, price_scale: priceScale, quote_currency: quoteCurrency } = item

  const result = {
    id: `bybit_${alias}`,
    source: EMarketDataSources.bybit,
    currency: quoteCurrency,
    name,
    ticker: alias,
    type: EMarketInstrumentTypes.Crypto,
    sourceSpecificData: item,
    priceScale
  }

  return result
}

export const bybitGetAllInstruments = async () => {
  try {
    const { result } = await byBitApi.getSymbols()

    const normalizedInstrumentsArray = result.map(normalizeItem)

    return normalizedInstrumentsArray
  } catch (e) {
    log.error(logPrefix, 'Fetch instruments error:', e)

    await wait(30000)

    // Retry
    return bybitGetAllInstruments()
  }
}
