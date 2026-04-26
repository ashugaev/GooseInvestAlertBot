import { TickerPrices } from 'prices'

import { log } from '@/helpers'
import { createDedupByKey } from '@/helpers/throttleLog'
import { lbankRequest } from '@/marketApi/lbank/index'
import { InstrumentsList } from '@/models'

const logPrefix = '[GET LBANK PRICES]'

// Дедуп: набор отсутствующих тикеров обычно стабилен (делистинги), не пишем
// одно и то же сообщение каждый цикл.
const dedupNotFound = createDedupByKey()

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

  const notFoundKey = notFoundItems.slice().sort().join(',')
  if (notFoundItems.length && dedupNotFound(notFoundKey)) {
    log.info(logPrefix, 'Not found items:', notFoundItems)
  } else if (!notFoundItems.length) {
    dedupNotFound('')
  }

  return pricesNormilized
}
