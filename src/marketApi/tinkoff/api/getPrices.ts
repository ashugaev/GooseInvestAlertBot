/**
 * Returns prices list for by id's
 */

import { TickerPrices } from 'prices'
import { LastPrice } from 'tinkoff-invest-api/src/generated/marketdata'

import { log } from '@/helpers'
import { chunks } from '@/helpers/array/chunks'
import { EMarketInstrumentTypes } from '@/models'

import { tinkoffApi } from '../../../app'
import { getFutureMarginByTickerId } from '../utils/getFutereMarginByTickerId'
import { moneyObjToValue } from '../utils/moneyObj'

const logPrefix = '[GET PRICES TINK]'

export const getTinkoffPrices = async (
  ids: string[],
  tickersData
): Promise<TickerPrices> => {
  // Api supports 3000 ids per request
  const idsChunks = chunks(ids, 2500)

  const lastPrices: LastPrice[] = []

  for (let i = 0; i < idsChunks.length; i++) {
    const idsChunk = idsChunks[i]
    const response = await tinkoffApi.marketdata.getLastPrices({
      figi: idsChunk,
    })
    lastPrices.push(...response.lastPrices)
  }

  const pricesNormalizes = []

  // Cache for logs
  const noMinPriceIncrementNumber = []

  for (let i = 0; i < lastPrices.length; i++) {
    try {
      const piceObj = lastPrices[i]
      const { price, figi } = piceObj

      const item = tickersData.find((el) => el.sourceSpecificData.figi === figi)

      if (!price) {
        // Some futures don't have prices in API
        continue
      }

      const tickerId = figi

      let priceNormalized = moneyObjToValue(price)

      const { nominal } = item.sourceSpecificData

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
        priceNormalized = (priceNormalized / 100) * normalizedNominal
      } else if (item?.type === EMarketInstrumentTypes.Etf) {
        // NOTE: Есть расхождения с сайтом на тикерах с лотом 100
        // no changes
      } else if (item?.type === EMarketInstrumentTypes.Future) {
        const futureMargin = await getFutureMarginByTickerId(tickerId)
        const minPriceIncrementNumber = moneyObjToValue(
          item.sourceSpecificData.minPriceIncrement
        )
        const minPriceIncrementAmountNumber = moneyObjToValue(
          futureMargin?.minPriceIncrementAmount
        )

        if (!minPriceIncrementNumber || !minPriceIncrementAmountNumber) {
          noMinPriceIncrementNumber.push(item.id)
          continue
        }

        // В данном кейса priceNormalized это цена в пунктах
        // В формуле соответственно переводим пункты в деньги
        priceNormalized =
          (priceNormalized / minPriceIncrementNumber) *
          minPriceIncrementAmountNumber
      }

      if (priceNormalized && tickerId && item) {
        const priceScale = item.priceScale || (priceNormalized > 1 ? 3 : 9)
        pricesNormalizes.push([
          item.ticker,
          Number(priceNormalized.toFixed(priceScale)),
          tickerId,
        ])
      } else {
        log.error(
          logPrefix + " Can't generate price data from:",
          priceNormalized,
          tickerId,
          item
        )
      }
    } catch (e) {
      log.error(logPrefix, 'Error in getTinkoffPrices', e)
    }
  }

  if (noMinPriceIncrementNumber.length > 150) {
    log.error(
      logPrefix,
      'No minPriceIncrementNumber or minPriceIncrementAmountNumber for',
      noMinPriceIncrementNumber.length
    )
  }

  return pricesNormalizes
}
