import { EMarketDataSources, EMarketInstrumentTypes } from '../../types'
import { InstrumentsList } from '../../../models'
const CoinGecko = require('coingecko-api')

export const CoinGeckoClient = new CoinGecko()

const normalizeCoingeckoItem = (item): InstrumentsList => {
  return {
    id: item.id,
    source: EMarketDataSources.coingecko,
    name: item.name,
    ticker: item.symbol.toUpperCase(),
    type: EMarketInstrumentTypes.Crypto,
    sourceSpecificData: {
      id: item.id
    }
  }
}

export const coingeckoGetAllInstruments = async () => {
  const result = await CoinGeckoClient.coins.list()

  // FIXME: Удаление wormhole монет это костыль, который уберется после перехода на id
  return result.data.map(normalizeCoingeckoItem).filter(el => !(/.*\(Wormhole\)$/.test(el.name)))
}
