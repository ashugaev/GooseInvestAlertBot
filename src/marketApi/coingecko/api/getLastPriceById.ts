import { CoinGeckoClient } from './getAllInstruments'

const NodeCache = require('node-cache')

const coinGeckoPriceCache = new NodeCache({
  stdTTL: 60
})

export async function coingeckoGetLastPriceById (id: string) {
  try {
    let currencyPrices = coinGeckoPriceCache.get(id)

    if (!currencyPrices) {
      currencyPrices = await CoinGeckoClient.simple.price({
        ids: [id],
        vs_currencies: ['eur', 'usd', 'rub']
      })

      if (!currencyPrices) {
        throw new Error('Невалидные данные от CoinGecko')
      }

      coinGeckoPriceCache.set(id, currencyPrices)
    }

    // FIXME: Это костыль который будет работать только до тех пор пока будем запрошивать по одной монете
    const pricesForCurrencies = Object.entries(currencyPrices.data)[0][1] as {usd: string}

    const price = pricesForCurrencies.usd

    if (!price) {
      throw new Error('Невалидные данные от CoinGecko')
    }

    return price
  } catch (e) {
    throw new Error(`Ошибка получения данных от CoinGecko, ${JSON.stringify(e)}`)
  }
}
