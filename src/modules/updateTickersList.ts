import { log } from '@helpers';
import { InstrumentsList, InstrumentsListModel } from '@models';

import { EMarketDataSources } from '../marketApi/types';

const logPrefix = '[UPDATE TICKERS LIST]';

interface UpdateTickersListParams {
  /**
   * Callback for get NORMALIZED tickers list
   */
  getList: () => Promise<InstrumentsList[]>
  /**
   * Source for DB update
   */
  source: EMarketDataSources
  /**
   * Check quantity value
   * For sure that API returns full list of currencies
   */
  minTickersCount: number
}

/**
 * Updates tickers for "source" (InstrumentsListModel)
 *
 * Double function for make in more suitable for cron initialization
 */
export const updateTickersList = ({ getList, source, minTickersCount }: UpdateTickersListParams) => async () => {
  const list = await getList();

  if (list.length < minTickersCount) {
    throw new Error(logPrefix + 'No items in array');
  }

  if (!source) {
    throw new Error(logPrefix + ' can\'t update tickers without source');
  }

  await InstrumentsListModel.bulkWrite([
    // Remove already unexisting (dead) tickers
    {
      deleteMany: {
        filter: {
          source,
          id: {
            // No include any id from list
            $nin: list.map(el => el.id)
          }
        }
      }
    },
    // Update existing and add new
    ...list.map((el) => ({
      updateOne: {
        // create if not exists
        upsert: true,
        filter: {
          source,
          id: el.id
        },
        update: el
      }
    }))
  ]);

  log.info(logPrefix, 'Список доступных инструментов в базе для', source, 'был обновлен', list.length);
};
