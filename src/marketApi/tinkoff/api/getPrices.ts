/**
 * Returns prices list for by id's
 */

import { log } from '@helpers'
import { EMarketInstrumentTypes } from '@models'
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

    const tickerId = figi
    const item = tickersData.find(el => el.id === tickerId)

    let priceNormalized = price.units + price.nano / 1000000000

    const { lot, nominal } = item.sourceSpecificData
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const normalizedNominal = nominal?.units + nominal?.nano / 1000000000

    // Different calculation for different instrument
    if (item?.type === EMarketInstrumentTypes.Currency) {
      // price * lot / nominal
      priceNormalized = priceNormalized / normalizedNominal
    } else if (item?.type === EMarketInstrumentTypes.Bond) {
      // price / 100 * nominal
      priceNormalized = priceNormalized / 100 * normalizedNominal
    } else if (item?.type === EMarketInstrumentTypes.Etf) {
      // price / min_price_increment * min_price_increment_amount
      // TODO: Не хватает min_price_increment_amount
      // Описано тут: https://tinkoff.github.io/investAPI/instruments/#getfuturesmargin
    }

    if (priceNormalized && tickerId && item) {
      res.push([item.ticker, priceNormalized, tickerId])
    } else {
      log.error(logPrefix + 'Can\'t generate price data from:', priceNormalized, tickerId, item)
    }

    return res
  }, [])

  return pricesNormalizes
}
