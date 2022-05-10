import { InstrumentsList } from '@models';
import axios from 'axios';

import { EMarketDataSources, EMarketInstrumentTypes } from '../types';
import { responseCache } from './currenciesListResponseCache';

const logPrefix = '[GET LIST]';

interface CurrencyListApiResponseItem {
  symbol: string
  name: string
  symbol_native: string
  decimal_digits: number
  rounding: number
  code: string
  name_plural: string
}

export interface CurrencyApiSpecificData {
  symbol: string
  baseAssetData: CurrencyListApiResponseItem
  quoteAssetData: CurrencyListApiResponseItem
};

/**
 * Popular codes for generating only popular pairs
 */
const popularCodes = ['GBP', 'CAD', 'CHF', 'RUB', 'EUR', 'JPY', 'USD', 'AUD', 'GEL', 'TRY'];

/**
 * Playground https://app.currencyapi.com/request-playground
 */
export const getCurrenciesList = async (): Promise<InstrumentsList[]> => {
  let response = null;

  try {
    // eslint-disable-next-line max-len
    response = (await axios(`https://api.currencyapi.com/v3/currencies?apikey=${process.env.CURRENCY_CONVERTER_APIKEY}&currencies=`)).data;
  } catch (e) {
    console.error(logPrefix, 'Currencies API failed', e);
    response = responseCache;
  }

  const dataArr: CurrencyListApiResponseItem[] = Object.values(response.data);

  const dataForPopularCodes: CurrencyListApiResponseItem[] = popularCodes.map(code => response.data[code]);

  if (!dataArr) {
    throw new Error('No data in currencies list');
  }

  const currencyPairs = dataArr.reduce<InstrumentsList[]>((acc, base) => {
    dataForPopularCodes.forEach(quote => {
      if (base.code === quote.code) {
        return;
      }

      let ticker = base.code + quote.code;

      acc.push({
        id: `currency_${ticker}`,
        source: EMarketDataSources.yahoo,
        name: base.name,
        ticker: ticker,
        type: EMarketInstrumentTypes.Currency,
        currency: quote.code,
        sourceSpecificData: {
          symbol: quote.symbol,
          baseAssetData: base,
          quoteAssetData: quote
        }
      });

      ticker = quote.code + base.code;

      acc.push({
        id: `currency_${ticker}`,
        source: EMarketDataSources.yahoo,
        name: quote.name,
        ticker: ticker,
        type: EMarketInstrumentTypes.Currency,
        currency: base.code,
        sourceSpecificData: {
          symbol: base.symbol,
          baseAssetData: quote,
          quoteAssetData: base
        }
      });
    });

    return acc;
  }, []);

  return currencyPairs;
};
