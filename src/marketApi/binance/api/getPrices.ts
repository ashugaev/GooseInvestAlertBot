/**
 * Returns all tickers prices list
 */

import { InstrumentsList } from '@models'
import { TickerPrices } from 'prices'

import { log } from '../../../helpers/log'
import { binance } from '../utils/binance'

const logPrefix = '[GET BINANCE PRICES]'

// eslint-disable-next-line max-len
export const getBinancePrices = async (tickerIds: string[], allBinanceInstruments: InstrumentsList[]): Promise<TickerPrices> => {
  const pricesObj = await binance.prices()

  const pricesArr = Object.entries(pricesObj).map(([key, val]) => ([key, Number(val)]))

  log.info('Binance instruments', allBinanceInstruments.length)

  const pricesArrWithId: TickerPrices = pricesArr.reduce<TickerPrices>((acc, [ticker, price]) => {
    const tickerId = allBinanceInstruments.find(el => el.ticker === ticker)?.id

    if (tickerId) {
      // @ts-expect-error Вообще типы корректные
      acc.push([ticker, price, tickerId])
    } else {
      log.error(logPrefix, 'Can\'t find Binance ticker in database for price from API', ticker)
    }

    return acc
  }, [])

  return pricesArrWithId
}
