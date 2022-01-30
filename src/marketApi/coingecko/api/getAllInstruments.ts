import { EMarketDataSources, EMarketInstrumentTypes } from '../../types'
import { InstrumentsList } from '../../../models'
const CoinGecko = require('coingecko-api')

export const CoinGeckoClient = new CoinGecko();

const normalizeCoingeckoItem = (item): InstrumentsList => {
  return {
    id: item.id,
    source: EMarketDataSources.coingecko,
    name: item.name,
    ticker: item.symbol.toUpperCase(),
    type: EMarketInstrumentTypes.Crypto,
    currency: 'USD',
    sourceSpecificData: {
      id: item.id
    }
  };
};

export const coingeckoGetAllInstruments = async () => {
  const result = await CoinGeckoClient.coins.list();

  return result.data.map(normalizeCoingeckoItem);
};
