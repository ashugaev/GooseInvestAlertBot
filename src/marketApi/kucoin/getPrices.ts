import { TickerPrices } from 'prices'

import { KucoinAPI } from '@/marketApi/kucoin/index'
import { InstrumentsList } from '@/models'

const logPrefix = '[GET KUCOIN PRICES]'

export interface KucoinPriceItem {
  symbol: string
  symbolName: string
  buy: string
  sell: string
  changeRate: string
  changePrice: string
  high: string
  low: string
  vol: string
  volValue: string
  last: string
  averagePrice: string
  takerFeeRate: string
  makerFeeRate: string
  takerCoefficient: string
  makerCoefficient: string
}

export const getPricesKucoin = async (
  tickerIds: string[],
  instrumentsData: InstrumentsList[]
): Promise<TickerPrices> => {
  try {
    const res = await KucoinAPI.rest.Market.Symbols.getAllTickers()

    const ticker = res?.data?.ticker ?? []

    const notFoundItems = []

    const pricesNormilized: TickerPrices = (
      ticker as KucoinPriceItem[]
    ).reduce<TickerPrices>((acc, item) => {
      const dataItem = instrumentsData.find(
        (el) => el.ticker === item.symbolName.replace('-', '')
      )

      const lastPrice = item.last
      const lastPriceNumber = Number(lastPrice)

      if (dataItem && lastPriceNumber) {
        acc.push([dataItem.ticker, lastPriceNumber, dataItem.id, dataItem])
      } else {
        notFoundItems.push(item.symbol)
      }

      return acc
    }, [])

    if (notFoundItems.length) {
      console.error(logPrefix, 'Not found items:', notFoundItems)
    }

    return pricesNormilized
  } catch (e) {
    console.log(logPrefix, e)
    throw e
  }
}
