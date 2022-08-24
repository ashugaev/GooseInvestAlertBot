import { InstrumentsList, InstrumentsListModel } from '../models';
import { log } from './log';
import { getLastPrice } from './stocksApi';

const logPrefix = '[GET INSTRUMENT DATA WITH PRICE]';

interface GetInstrumentDataWithPrice {
  price: number
  instrumentData: InstrumentsList
}

export interface IGetInstrumentDataWithPrice {
  /**
   * Только для случая, когда мы получаем тикер из ввода юзер, во всех остальных кейсах юзать id
   * Только для этого кейса в массиве может быть больше одного элемента
   */
  symbol?: string
  id?: string
}

export async function getInstrumentDataWithPrice ({
  symbol,
  id
}: IGetInstrumentDataWithPrice): Promise<GetInstrumentDataWithPrice[]> {
  try {
    if (!id && !symbol) {
      log.error(logPrefix, 'Ошибка входных данных');
      return [];
    }

    let instrumentsList = null;

    if (id && !symbol) {
      instrumentsList = await InstrumentsListModel.find({ id }).lean();
    }

    if (symbol && !id) {
      symbol = symbol.toUpperCase();

      instrumentsList = await InstrumentsListModel.find({ ticker: symbol }).lean();
    }

    if (!instrumentsList?.length) {
      log.error(logPrefix, 'Ошибка получения данных для', symbol || id);

      return [];
    }

    const dataWithPrice = [];

    for (let i = 0; i < instrumentsList.length; i++) {
      const instrumentData = instrumentsList[i];
      let lastPrice = null;

      try {
        log.info(logPrefix, 'Ciongecko. Trying get price.');
        lastPrice = await getLastPrice({ id: instrumentData.id, instrumentData });
        log.info(logPrefix, 'Ciongecko. Fetch SUCCESS');
      } catch (e) {
        log.error(logPrefix, 'Ciongecko. Fetch ERROR', e);

        try {
          lastPrice = await getLastPrice({ id: instrumentData.id, instrumentData });
          log.info(logPrefix, 'Ciongecko. RETRY fetch SUCCESS', e);
        } catch (e) {
          log.error(logPrefix, 'Ciongecko. RETRY fetch ERROR', e);
        }
      }

      dataWithPrice.push({ instrumentData, price: lastPrice });
    }

    return dataWithPrice;
  } catch (e) {
    log.error(logPrefix, 'Ошибка получения данных', e);

    return [];
  }
}
