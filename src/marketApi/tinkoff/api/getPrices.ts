/**
 * Returns prices list for by id's
 */

import { log } from '@helpers'
import { EMarketInstrumentTypes } from '@models'
import { TickerPrices } from 'prices'
import { GetLastPricesResponse } from 'tinkoff-invest-api/src/generated/marketdata'

import { tinkoffApi } from '../../../app'
import { getFutureMarginByTickerId } from '../utils/getFutereMarginByTickerId'
import { moneyObjToValue } from '../utils/moneyObj'

const logPrefix = '[GET PRICES TINK]'

export const getTinkoffPrices = async (ids: string[], tickersData): Promise<TickerPrices> => {
  const lastPrices: GetLastPricesResponse = (await tinkoffApi.marketdata.getLastPrices({ figi: ids }))

  const pricesNormalizes = []

  for (let i = 0; i < lastPrices.lastPrices.length; i++) {
    try {
      const piceObj = lastPrices.lastPrices[i]
      const { price, figi } = piceObj

      const item = tickersData.find(el => el.sourceSpecificData.figi === figi)

      if (!price) {
        log.info(logPrefix, 'NO price for', item.source, item.id)
        continue
      }

      const tickerId = figi

      let priceNormalized = moneyObjToValue(price)

      const { lot, nominal } = item.sourceSpecificData

      // FIXME: Not sure than 1 by default is Ok
      const normalizedNominal = nominal ? moneyObjToValue(nominal) : 1

      /**
     * Different calculation for different instrument
     * @see https://tinkoff.github.io/investAPI/head-marketdata/#_4
     * @see https://tinkoff.github.io/investAPI/faq_marketdata/
     */
      if (item?.type === EMarketInstrumentTypes.Currency) {
        priceNormalized = priceNormalized / normalizedNominal
      } else if (item?.type === EMarketInstrumentTypes.Bond) {
        priceNormalized = priceNormalized / 100 * normalizedNominal
      } else if (item?.type === EMarketInstrumentTypes.Etf) {
      // FIXME: Wrong price for lot === 100
      // no changes
      } else if (item?.type === EMarketInstrumentTypes.Future) {
        const futureMargin = await getFutureMarginByTickerId(tickerId)
        const minPriceIncrementNumber = moneyObjToValue(item.sourceSpecificData.minPriceIncrement)
        const minPriceIncrementAmountNumber = moneyObjToValue(futureMargin?.minPriceIncrementAmount)

        if (!minPriceIncrementNumber || !minPriceIncrementAmountNumber) {
          log.error(logPrefix, 'No minPriceIncrementNumber or minPriceIncrementAmountNumber for', item.id)
          continue
        }

        // В данном кейса priceNormalized это цена в пунктах
        // В формуле соответственно переводим пункты в деньги
        priceNormalized = priceNormalized / minPriceIncrementNumber * minPriceIncrementAmountNumber
      }

      if (priceNormalized && tickerId && item) {
        pricesNormalizes.push([item.ticker, Number((priceNormalized).toFixed(3)), tickerId])
      } else {
        log.error(logPrefix + 'Can\'t generate price data from:', priceNormalized, tickerId, item)
      }
    } catch (e) {
      log.error(logPrefix, 'Error in getTinkoffPrices', e)
    }
  }

  return pricesNormalizes
}
