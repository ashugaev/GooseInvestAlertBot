import { MarketInstrument } from '@tinkoff/invest-openapi-js-sdk/build/domain';

import { log } from '../../../helpers/log';
import { stocksApi } from '../../../helpers/stocksApi';
import { wait } from '../../../helpers/wait';
import { EMarketDataSources, InstrumentsList } from '../../../models';

const normalizeTinkoffItem = (item): InstrumentsList => {
  const { ticker, name, type, currency, ...specificData } = item;

  return {
    id: specificData.figi,
    source: EMarketDataSources.tinkoff,
    name,
    ticker,
    type,
    currency,
    sourceSpecificData: specificData
  };
};

export const tinkoffGetAllInstruments = () => new Promise<any[]>(async (rs) => {
  try {
    const allInstrumentsPromises = [
      stocksApi.stocks(),
      stocksApi.etfs(),
      stocksApi.bonds()
    ];

    const allInstruments = await Promise.all(allInstrumentsPromises);

    const instrumentsArray = allInstruments.reduce<MarketInstrument[]>((acc, el) => acc.concat(el.instruments), []);

    const normalizedInstrumentsArray = instrumentsArray.map(normalizeTinkoffItem);

    rs(normalizedInstrumentsArray);
  } catch (e) {
    log.error('Ошибка получения списка иструментов:', e);

    await wait(30000);

    // Ретрай
    rs(await tinkoffGetAllInstruments());
  }
});
