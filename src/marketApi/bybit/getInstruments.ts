// @ts-expect-error
import { CategoryCursorListV5, InstrumentInfoV5Mapping } from 'bybit-api'

import { log } from '@/helpers/log'
import { EMarketDataSources } from '@/marketApi/types'
import { EMarketInstrumentTypes, InstrumentsList } from '@/models'

import { wait } from '../../helpers/wait'
import { byBitApi } from './api'

const logPrefix = '[BYBIT GET ALL INSTRUMENTS]'

const normalizeItem = (
  item: CategoryCursorListV5<InstrumentInfoV5Mapping['spot'], 'spot'>['list'][0]
): InstrumentsList => {
  const { symbol, lotSizeFilter, quoteCoin: quoteCurrency } = item

  const quotePrecision = lotSizeFilter.quotePrecision
  const decimalPlaces = quotePrecision.split('.')[1].length

  const result = {
    id: `bybit_${symbol}`,
    source: EMarketDataSources.bybit,
    currency: quoteCurrency,
    name: symbol,
    ticker: symbol,
    type: EMarketInstrumentTypes.Crypto,
    sourceSpecificData: item,
    priceScale: decimalPlaces,
  }

  return result
}

export const bybitGetAllInstruments = async () => {
  try {
    const { result } = await byBitApi.getInstrumentsInfo({
      category: 'spot',
    })

    const normalizedInstrumentsArray = result.list.map(normalizeItem)

    return normalizedInstrumentsArray
  } catch (e) {
    log.error(logPrefix, 'Fetch instruments error:', e)

    await wait(30000)

    // Retry
    return bybitGetAllInstruments()
  }
}
