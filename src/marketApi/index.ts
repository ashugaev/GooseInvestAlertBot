import { log } from '../helpers/log';
import { InstrumentsList } from '../models';
import { binanceGetAllInstruments } from './binance/api/getAllInstruments';
import { coingeckoGetAllInstruments } from './coingecko/api/getAllInstruments';
import { tinkoffGetAllInstruments } from './tinkoff/api/getAllInstruments';

/**
 * Получает список всех инструментов подключенных к боту
 *
 * TODO: перенести внутрь cron/ папки
 */
export const getAllInstruments = async (): Promise<InstrumentsList[]> => {
  const allInstrumentsPromises = [
    coingeckoGetAllInstruments(),
    tinkoffGetAllInstruments(),
    binanceGetAllInstruments()
  ];

  const allInstrumentsArr = await Promise.all(allInstrumentsPromises);

  const allInstruments = allInstrumentsArr.reduce((acc, el) => acc.concat(el), []);

  log.info('Получены монеты и акции', allInstruments.length);

  return allInstruments;
};
