import { InstrumentsList } from '../../../models';
import { EMarketDataSources, EMarketInstrumentTypes } from '../../types';
const CoinGecko = require('coingecko-api');

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

  return result.data.map(normalizeCoingeckoItem)
  // FIXME: Удаление wormhole монет это костыль, который уберется после перехода на id
  // Фильтрация говнотикеров у которых нет основных данных
    .filter(el => !(/.*\(Wormhole\)$/.test(el.name)) && el.id?.length && el.name?.length && el.symbol?.length);
};
