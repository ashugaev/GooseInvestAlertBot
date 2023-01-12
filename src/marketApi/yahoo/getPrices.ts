/**
 * Swagger
 * https://www.yahoofinanceapi.com/
 */

import { log } from '@helpers'
import { InstrumentsList } from '@models'
import axios from 'axios'

const logPrefix = '[GET YAHOO PRICES]'

export const getYahooPrices = async (tickerIds: string[], coinsData: InstrumentsList[]) => {
  const yahooRequestSymbols = coinsData.map(el => el.ticker + '=X').join(',')

  // eslint-disable-next-line max-len
  const {
    data: {
      quoteResponse: {
        result,
        error
      }
    }
  } = await axios(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooRequestSymbols}`)

  if (error) {
    throw new Error(logPrefix.concat(error))
  }

  const prices = result.reduce((acc, el) => {
    const elTicker = el.symbol.replace('=X', '')
    const coinData = coinsData.find(item => elTicker === item.ticker)

    if (!coinData) {
      log.error(logPrefix.concat('No coinData obj for ', elTicker))
    } else {
      acc.push([coinData.ticker, el.regularMarketPrice, coinData.id])
    }

    return acc
  }, [])

  if (tickerIds.length < prices.length) {
    const uncheckedTickers = tickerIds.filter(el => !prices.find(item => item[0] === el))

    log.error(logPrefix + 'Can\t get prices for:', uncheckedTickers.join(','))
  }

  return prices
}
