/**
 * Returns all tickers prices list
 */

import { TickerPrices } from 'prices'

import { InstrumentsList } from '@/models'

import { log } from '../../../helpers/log'
import { binance } from '../utils/binance'

const logPrefix = '[GET BINANCE PRICES]'

// eslint-disable-next-line max-len
export const getBinancePrices = async (tickerIds: string[], allBinanceInstruments: InstrumentsList[]): Promise<TickerPrices> => {
  const pricesObj = await binance.prices()

  const pricesArr = Object.entries(pricesObj).map(([key, val]) => ([key, Number(val)]))

  log.info('Binance instruments', allBinanceInstruments.length)

  const tickersWithNoPrice = []

  const pricesArrWithId: TickerPrices = pricesArr.reduce<TickerPrices>((acc, [ticker, price]) => {
    const tickerId = allBinanceInstruments.find(el => el.ticker === ticker)?.id

    if (tickerId) {
      // @ts-expect-error Вообще типы корректные
      acc.push([ticker, price, tickerId])
    } else {
      tickersWithNoPrice.push(ticker)
    }

    return acc
  }, [])

  if (tickersWithNoPrice.length > 15) {
    log.error(logPrefix, 'Can\'t find Binance tickers in database for price from API', tickersWithNoPrice)
  }

  return pricesArrWithId
}
