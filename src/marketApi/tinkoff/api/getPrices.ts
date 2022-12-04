/**
 * Returns prices list for by id's
 */

import { log } from '@helpers'
import { TickerPrices } from 'prices'
import { GetLastPricesResponse } from 'tinkoff-invest-api/src/generated/marketdata'

import { tinkoffApi } from '../../../app'

const logPrefix = '[GET PRICES TINK]'

export const getTinkoffPrices = async (ids: string[], tickersData): Promise<TickerPrices> => {
  const lastPrices: GetLastPricesResponse = (await tinkoffApi.marketdata.getLastPrices({ figi: ids }))

  const pricesNormalizes = lastPrices.lastPrices.reduce((res, { price, figi }) => {
    if (!price) {
      log.info(logPrefix, 'NO price for', figi)
      return res
    }

    const priceNormalized = price.units + Number('0.' + price.nano.toString())
    const tickerId = figi
    const ticker = tickersData.find(el => el.id === tickerId)

    if (priceNormalized && tickerId && ticker) {
      res.push([ticker, priceNormalized, tickerId])
    } else {
      console.error(logPrefix + 'Can\'t generate price data from:', priceNormalized, tickerId, ticker)
    }

    return res
  }, [])

  return pricesNormalizes
}
