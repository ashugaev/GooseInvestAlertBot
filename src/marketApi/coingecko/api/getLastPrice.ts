import { log } from '@helpers';

import { wait } from '../../../helpers/wait';
import { CoinGeckoClient } from './getAllInstruments';

const NodeCache = require('node-cache');

const logPrefix = '[GET LAST PRICE]';

const coinGeckoPriceCache = new NodeCache({
  stdTTL: 120
});

export async function coingeckoGetLastPrice ({ instrumentData }) {
  try {
    // FIXME: цену берем не по тикеру
    let currencyPrices = coinGeckoPriceCache.get(instrumentData.ticker);

    log.info(logPrefix, 'Price from cache', currencyPrices);

    if (!currencyPrices) {
      try {
        currencyPrices = await CoinGeckoClient.simple.price({
          ids: [instrumentData.id],
          vs_currencies: ['eur', 'usd', 'rub']
        });
      } catch (e) {
        try {
          console.error('Coingeko Retry');

          await wait(300);

          currencyPrices = await CoinGeckoClient.simple.price({
            ids: [instrumentData.id],
            vs_currencies: ['eur', 'usd', 'rub']
          });

          console.error('Coingeko Retry success');
        } catch (e) {
          console.error('Coingeko Retry fail');
          console.error(e);
          throw new Error('Coingeko request fails');
        }
      }

      if (!currencyPrices) {
        throw new Error('Невалидные данные от CoinGecko');
      }

      coinGeckoPriceCache.set(instrumentData.ticker, currencyPrices);
    }

    // FIXME: Это костыль который будет работать только до тех пор пока будем запрошивать по одной менете
    const pricesForCurrencies = Object.entries(currencyPrices.data)[0][1];

    const currency = instrumentData.currency?.toLowerCase() ?? 'usd';

    const price = pricesForCurrencies[currency];

    if (!price) {
      throw new Error('Невалидные данные от CoinGecko');
    }

    return price;
  } catch (e) {
    console.error('Error:', e, 'Instrument', instrumentData);
    throw new Error(`Ошибка получения данных от CoinGecko 1, ${JSON.stringify(e)}`);
  }
}
