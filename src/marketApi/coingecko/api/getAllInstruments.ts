import { log } from '@helpers';

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
  const { data } = await CoinGeckoClient.coins.list();

  if (!data.length) {
    log.error('Error:', data);
    throw new Error('Не пришли данные из CoinGeko');
  }

  return data.map(normalizeCoingeckoItem)
  // FIXME: Удаление wormhole монет это костыль, который уберется после перехода на id
  // Фильтрация говнотикеров у которых нет основных данных
    .filter(el => !(/.*\(Wormhole\)$/.test(el.name)) && el.id?.length && el.name?.length && el.ticker?.length);
};
