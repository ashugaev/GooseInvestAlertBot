import { TickerPrices } from 'prices'

import { log } from '@/helpers'
import { byBitApi } from '@/marketApi/bybit/api'
import { InstrumentsList } from '@/models'

const logPrefix = '[GET BYBIT PRICES]'

export interface ByBitPriceItem {
  last_price: string
  symbol: string
}

export const bybitGetPrices = async (
  tickerIds: string[],
  instrumentsData: InstrumentsList[]
): Promise<TickerPrices> => {
  const response = await byBitApi.getTickers({
    category: 'spot',
  })
  const result = response.result.list

  const pricesNormilized: TickerPrices = result.reduce((acc, priceItem) => {
    const dataItem = instrumentsData.find(
      (el) => el.ticker === priceItem.symbol
    )
    const { lastPrice: lastPrice } = priceItem
    const lastPriceNumber = Number(lastPrice)

    if (dataItem && lastPriceNumber) {
      acc.push([dataItem.ticker, lastPriceNumber, dataItem.id, dataItem])
    } else {
      log.warn(
        logPrefix,
        'Price saving error',
        priceItem.symbol,
        lastPriceNumber
      )
    }

    return acc
  }, [])

  return pricesNormilized
}
