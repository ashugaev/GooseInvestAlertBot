import * as Sentry from '@sentry/node';
import { MarketInstrument } from '@tinkoff/invest-openapi-js-sdk/build/domain';

import { coingeckoGetLastPrice } from '../marketApi/coingecko/api/getLastPrice';
import { coingeckoGetLastPriceById } from '../marketApi/coingecko/api/getLastPriceById';
import { TINKOFF_SENTRY_TAGS } from '../marketApi/constants';
import { tinkoffGetLastPrice } from '../marketApi/tinkoff/api/getLastPrice';
import { tinkoffGetLastPriceByFigi } from '../marketApi/tinkoff/api/getLastPriceByFigi';
import { EMarketDataSources } from '../marketApi/types';
import { InstrumentsList, InstrumentsListModel } from '../models';
import { getLastPriceFromCache } from '../modules';

const NodeCache = require('node-cache');
const OpenAPI = require('@tinkoff/invest-openapi-js-sdk');

const apiURL = 'https://api-invest.tinkoff.ru/openapi';
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
const secretToken = process.env.STOCKS_API_TOKEN;

// Тут хранится время последней отправки логов в sentry, что бы ограничивать количество логов
let tinkoffApiFailureSentTime = 0;

export const stocksApi = new OpenAPI({ apiURL, secretToken, socketURL });

export interface GetLastPriceData extends MarketInstrument {
  lastPrice: number
}

export interface IGetInfoBySymbolParams {
  /**
   * id тикера по которому получим данные
   */
  id: string
  /**
   * Вспомогательные необязательные данные, что бы не делать допзапрос для их получения
   */
  instrumentData?: InstrumentsList
}

const symbolInfoCache = new NodeCache({
  // Кэшируем на всегда (обновится при только после перезапуска контейнера)
  // TODO: Возможно это имеет смысл хранить в базе, эти данные вероятно не изменятся никогда
  stdTTL: 0
});

// eslint-disable-next-line no-async-promise-executor,@typescript-eslint/promise-function-async
export const getInfoBySymbol = (symbol: string) => new Promise<MarketInstrument>(async (resolve, reject) => {
  try {
    let data = symbolInfoCache.get(symbol);

    if (!data) {
      data = await stocksApi.searchOne({ ticker: symbol });

      symbolInfoCache.set(symbol, data);
    }

    // Полагаюсь что data=null признак того, что это успешный ответ от апи и мы просто ничего не нашли по тикеру
    if (data === null) {
      reject({
        cantFind: true,
        message: `Заданный инструмент ${symbol} не найден у брокера`
      });

      return;
    }

    resolve(data);
  } catch (e) {
    const currentTime = new Date().getTime();

    // Если прошло больше часа
    const noSentry = (currentTime - tinkoffApiFailureSentTime) < 3600000;

    console.error('[StocksApi] Ошибка ответа тиньковской апишски', e);

    if (!noSentry) {
      Sentry.captureException('Ошибка ответа тиньковской апишски', {
        tags: TINKOFF_SENTRY_TAGS
      });

      tinkoffApiFailureSentTime = currentTime;
    }

    reject(e);
  }
});

/**
 * Вернет цену по id
 * Если нет instrumentData, то сходит в базу и достанет его по тикеру
 *
 * TODO: Отвязаться в логике от эксепшенов этой-фции
 */
export const getLastPrice = async ({
  id,
  instrumentData: data
}: IGetInfoBySymbolParams) => {
  let instrumentData = data;

  if (!id) {
    throw new Error('Необходимо предоставить id либо ticker для получения последней цены');
  }

  if (!instrumentData) {
    // @ts-expect-error FIXME: Тип проверить
    instrumentData = (await InstrumentsListModel.find({ id }).lean())[0];
  }

  if (!instrumentData) {
    throw new Error('Ошибка получения информации по инструменту');
  }

  let lastPrice;

  if (!instrumentData.source || (instrumentData.source === EMarketDataSources.tinkoff)) {
    lastPrice = await tinkoffGetLastPrice({ instrumentData });
  } else if (instrumentData.source === EMarketDataSources.coingecko) {
    lastPrice = await coingeckoGetLastPrice({ instrumentData });
  } else if (instrumentData.source === EMarketDataSources.binance) {
    lastPrice = await getLastPriceFromCache(instrumentData.id);
  } else if (instrumentData.source === EMarketDataSources.yahoo) {
    lastPrice = await getLastPriceFromCache(instrumentData.id);
  } else {
    throw new Error('Инструмент без параметра source');
  }

  if (!lastPrice) {
    throw new Error('Не была получена последняя цена инструмента');
  }

  return lastPrice;
};

/**
 * Вернет цену по id монеты
 */
export const getLastPriceById = async (id: string, source: EMarketDataSources) => {
  try {
    let lastPrice;

    if (source === EMarketDataSources.tinkoff) {
      lastPrice = await tinkoffGetLastPriceByFigi(id);
    } else if (source === EMarketDataSources.coingecko) {
      lastPrice = await coingeckoGetLastPriceById(id);
    } else if (source === EMarketDataSources.binance) {
      lastPrice = await getLastPriceFromCache(id);
    } else if (source === EMarketDataSources.yahoo) {
      lastPrice = await getLastPriceFromCache(id);
    } else {
      throw new Error('Инструмент без параметра source');
    }

    if (!lastPrice) {
      throw new Error('Не была получена последняя цена инструмента');
    }

    return lastPrice;
  } catch (e) {
    throw new Error(e);
  }
};
