/**
 * Returns prices list for by id's
 */

import { log } from '@helpers'
import { EMarketInstrumentTypes } from '@models'
import { TickerPrices } from 'prices'
import { GetLastPricesResponse } from 'tinkoff-invest-api/src/generated/marketdata'

import { tinkoffApi } from '../../../app'
import { moneyObjToValue } from '../utils/moneyObj'

const logPrefix = '[GET PRICES TINK]'

export const getTinkoffPrices = async (ids: string[], tickersData): Promise<TickerPrices> => {
  const lastPrices: GetLastPricesResponse = (await tinkoffApi.marketdata.getLastPrices({ figi: ids }))

  const pricesNormalizes = []

  for (let i = 0; i < lastPrices.lastPrices.length; i++) {
    const { price, figi } = lastPrices.lastPrices[i]

    const item = tickersData.find(el => el.id === figi)

    console.log(logPrefix, 'type', i, item.type)

    if (!price) {
      log.info(logPrefix, 'NO price for', item)
      continue
    }

    const tickerId = figi

    let priceNormalized = moneyObjToValue(price)

    const { lot, nominal } = item.sourceSpecificData
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const normalizedNominal = moneyObjToValue(nominal)

    /**
     * Different calculation for different instrument
     * @see https://tinkoff.github.io/investAPI/head-marketdata/#_4
     * @see https://tinkoff.github.io/investAPI/faq_marketdata/
     */
    if (item?.type === EMarketInstrumentTypes.Currency) {
      // price * lot / nominal
      priceNormalized = priceNormalized / normalizedNominal
    } else if (item?.type === EMarketInstrumentTypes.Bond) {
      // price / 100 * nominal
      priceNormalized = priceNormalized / 100 * normalizedNominal
    } else if (item?.type === EMarketInstrumentTypes.Etf) {
      // price * lot / nominal
      priceNormalized = priceNormalized / normalizedNominal
    } else if (item?.type === EMarketInstrumentTypes.Futures) {
      // Данные необходимые для рассчета цен на фьючерсы
      const futuresMargin = (await tinkoffApi.instruments.getFuturesMargin({ figi }))

      // price / min_price_increment * min_price_increment_amount
      priceNormalized = priceNormalized * moneyObjToValue(item.sourceSpecificData.minPriceIncrementAmount)
      // TODO: Не хватает min_price_increment_amount
      // Описано тут: https://tinkoff.github.io/investAPI/instruments/#getfuturesmargin
    }

    if (priceNormalized && tickerId && item) {
      pricesNormalizes.push([item.ticker, priceNormalized, tickerId])
    } else {
      log.error(logPrefix + 'Can\'t generate price data from:', priceNormalized, tickerId, item)
    }
  }

  return pricesNormalizes
}
