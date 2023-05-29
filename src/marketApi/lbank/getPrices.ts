import { TickerPrices } from 'prices'

import { log } from '@/helpers'
import { lbankRequest } from '@/marketApi/lbank/index'
import { InstrumentsList } from '@/models'

const logPrefix = '[GET LBANK PRICES]'

export interface LbankPriceItem {
  symbol: string
  ticker: {
    high: number
    vol: number
    low: number
    change: number
    turnover: number
    latest: number
  }
  timestamp: number
}

export const lbankGetPrices = async (
  tickerIds: string[],
  instrumentsData: InstrumentsList[]
): Promise<TickerPrices> => {
  try {
    const {
      data: { data },
    } = await lbankRequest('/v2/ticker.do?symbol=all')

    const notFoundItems = []

    const pricesNormilized: TickerPrices = (
      data as LbankPriceItem[]
    ).reduce<TickerPrices>((acc, item) => {
      const dataItem = instrumentsData.find(
        // @ts-ignore
        (el) => el.sourceSpecificData.symbol === item.symbol
      )

      const lastPriceNumber = item.ticker.latest

      if (dataItem && lastPriceNumber) {
        acc.push([dataItem.ticker, lastPriceNumber, dataItem.id, dataItem])
      } else {
        notFoundItems.push(item.symbol)
      }

      return acc
    }, [])

    if (notFoundItems.length) {
      log.info(logPrefix, 'Not found items:', notFoundItems)
    }

    return pricesNormilized
  } catch (e) {
    console.log(e)
    throw e
  }
}
