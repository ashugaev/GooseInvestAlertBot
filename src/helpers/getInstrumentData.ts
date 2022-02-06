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
      instrumentsList = await InstrumentsListModel.find({ symbol }).lean();
    }

    if (!instrumentsList?.length) {
      log.error(logPrefix, 'Ошибка получения данных для', symbol || id);

      return [];
    }

    const dataWithPrice = [];

    for (let i = 0; i < instrumentsList.length; i++) {
      const instrumentData = instrumentsList[i];
      const lastPrice = await getLastPrice({ id: instrumentData.id, instrumentData });

      dataWithPrice.push({ instrumentData, price: lastPrice });
    }

    return dataWithPrice;
  } catch (e) {
    log.error(logPrefix, 'Ошибка получения данных', e);

    return [];
  }
}
