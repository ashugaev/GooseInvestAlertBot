import { log } from '@helpers';
import { InstrumentsList } from '@models';
import { TickerPrices } from 'prices';

import { CoinGeckoClient } from './getAllInstruments';

const logPrefix = '[COINGECKO GET PRICES BY IDS]';

export async function coingeckoGetLastPriceById (ids: Array<Pick<InstrumentsList, 'id'>>, tickersData): Promise<TickerPrices> {
  const tickersDataObj = tickersData.reduce((acc, el) => {
    acc[el.id] = el;

    return acc;
  }, {});

  const currencyPrices = await CoinGeckoClient.simple.price({
    ids: [ids],
    vs_currencies: ['eur', 'usd', 'rub']
  });

  if (!currencyPrices.success) {
    log.error('CoinGecko quota exceeded', currencyPrices);
    throw new Error('CoinGecko quota exceeded');
  }

  const { data } = currencyPrices;

  const responseArray = Object.entries(data);

  const prices = responseArray.reduce((acc, [key, val]) => {
    const { usd } = val as {usd: number};

    const tickerData = tickersDataObj[key];
    const ticker = tickerData.ticker;
    const price = usd;

    if (ticker?.length && price) {
      // ticker, price, tickerId
      acc.push([ticker, usd, key]);
    }

    return acc;
  }, []);

  // TODO: Move this check to 'setupPriceUpdater'
  if (ids.length > prices.length) {
    const uncheckedTickers = ids.filter(el => !prices.find(item => item[2] === el));

    log.error(logPrefix + ' Can\'t get prices for:', uncheckedTickers.join(','));
  }

  return prices;
}
