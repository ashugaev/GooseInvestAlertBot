/**
 * Returns prices list for by id's
 */

import { log } from '@helpers'
import { EMarketInstrumentTypes } from '@models'
import { TickerPrices } from 'prices'
import { GetLastPricesResponse } from 'tinkoff-invest-api/src/generated/marketdata'

import { tinkoffApi } from '../../../app'
import { getTinkoffInstrumentLink } from '../../../helpers/getInstrumentLInk'
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
        log.info(logPrefix, 'NO price for', item)
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
      // Данные необходимые для рассчета цен на фьючерсы
        const futuresMargin = (await tinkoffApi.instruments.getFuturesMargin({ figi }))

        // price / min_price_increment * min_price_increment_amount
        // eslint-disable-next-line max-len
        const minPriceIncrementNumber = moneyObjToValue(item.sourceSpecificData.minPriceIncrement)
        const minPriceIncrementAmountNumber = moneyObjToValue(futuresMargin.minPriceIncrementAmount)
        const prevPriceNormalized = priceNormalized

        // В данном кейса priceNormalized это цена в пунктах
        // В формуле соответственно переводим пункты в деньги
        priceNormalized = priceNormalized / minPriceIncrementNumber * minPriceIncrementAmountNumber

        console.log('priceNormalized', priceNormalized)
        console.log(getTinkoffInstrumentLink({ ticker: item.ticker, type: item.type }))
      }

      if (priceNormalized && tickerId && item) {
        log.info(
          'check price link',
          lot, item.ticker, item.type,
          priceNormalized,
          getTinkoffInstrumentLink({ ticker: item.ticker, type: item.type })
        )
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
