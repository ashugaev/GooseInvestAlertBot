import { InstrumentsList } from '../models';
import { coingeckoGetAllInstruments } from './coingecko/api/getAllInstruments';
import { tinkoffGetAllInstruments } from './tinkoff/api/getAllInstruments';

/**
 * Получает список всех инструментов подключенных к боту
 *
 * TODO: перенести внутрь cron папки
 */
export const getAllInstruments = async (): Promise<InstrumentsList[]> => {
  const allInstrumentsPromises = [
    coingeckoGetAllInstruments(),
    tinkoffGetAllInstruments()
  ];

  const allInstrumentsArr = await Promise.all(allInstrumentsPromises);

  const allInstruments = allInstrumentsArr.reduce((acc, el) => acc.concat(el), []);

  return allInstruments;
};
