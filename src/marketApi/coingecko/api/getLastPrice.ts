import { CoinGeckoClient } from './getAllInstruments';

const NodeCache = require('node-cache');

const coinGeckoPriceCache = new NodeCache({
  stdTTL: 60
});

export async function coingeckoGetLastPrice ({ instrumentData }) {
  try {
    // FIXME: цену берем не по тикеру
    let currencyPrices = coinGeckoPriceCache.get(instrumentData.ticker);

    if (!currencyPrices) {
      currencyPrices = await CoinGeckoClient.simple.price({
        ids: [instrumentData.id],
        vs_currencies: ['eur', 'usd', 'rub']
      });

      if (!currencyPrices) {
        throw new Error('Невалидные данные от CoinGecko');
      }

      coinGeckoPriceCache.set(instrumentData.ticker, currencyPrices);
    }

    // FIXME: Это костыль который будет работать только до тех пор пока будем запрошивать по одной менете
    const pricesForCurrencies = Object.entries(currencyPrices.data)[0][1];

    const currency = instrumentData.sourceSpecificData?.currency?.toLowerCase() ?? 'usd';

    const price = pricesForCurrencies[currency];

    if (!price) {
      throw new Error('Невалидные данные от CoinGecko');
    }

    return price;
  } catch (e) {
    throw new Error(`Ошибка получения данных от CoinGecko, ${JSON.stringify(e)}`);
  }
}
