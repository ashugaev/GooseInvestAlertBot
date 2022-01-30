// Dependencies
import { InstrumentType } from '@tinkoff/invest-openapi-js-sdk/build/domain';
import { getModelForClass, prop } from '@typegoose/typegoose';

import { EMarketDataSources, EMarketInstrumentTypes } from './InstrumentsList';

export interface AddPriceAlertParams {
  tickerId: string
  user: number
  symbol: string
  lowerThen?: number
  greaterThen?: number
  name: string
  currency: string
  type: EMarketInstrumentTypes
  source: EMarketDataSources
  initialPrice: number
}

export interface RemoveOrGetAlertParams {
  user?: number
  symbol?: string
  lowerThen?: number
  greaterThen?: number
  _id?: string
}

export class PriceAlert {
  /**
   * Id по по которому ищем данные о цене (отвязываемся от названия тикера)
   *
   * "required: false" и "unique:false" - временное решение. Вообще у всех новых алертов id будет в обязательном порядке
   */
  @prop({ unique: false })
  tickerId: string;

  @prop({ required: true })
  user: number;

  @prop({ required: true })
  symbol: string;

  @prop()
  lowerThen: number;

  @prop()
  greaterThen: number;

  @prop()
  lastCheckedAt: Date;

  @prop()
  message: string;

  @prop({ required: true })
  name: string;

  @prop({ required: true })
  currency: string;

  // Вообще обязательное поле, но есть пулл алертов, которые были созданы до его появления
  @prop()
  type: InstrumentType;

  // Вообще обязательное поле, но есть пулл алертов, которые были созданы до его появления
  @prop()
  source: EMarketDataSources;

  /**
     * Цена на момент создания алерта
     */
  @prop()
  initialPrice: number;
}

export interface PriceAlertItem extends PriceAlert {
  _id: string
}

interface ICheckAlertsParams {
  symbol: string
  price: number
}

// Get PriceAlertModel model
const PriceAlertModel = getModelForClass(PriceAlert, {
  schemaOptions: { timestamps: true },
  options: {
    customName: 'priceAlerts'
  }
});

export const addPriceAlerts = (newAlerts: AddPriceAlertParams[]): Promise<PriceAlertItem[]> => {
  const lastCheckedAt = new Date();

  const normalizedAlerts = newAlerts.map(alert => ({
    ...alert,
    symbol: alert.symbol.toUpperCase(),
    lastCheckedAt
  }));

  return PriceAlertModel.insertMany(normalizedAlerts);
};

export function getUniqSymbols (number: number): Promise<string[]> {
  return new Promise(async (rs, rj) => {
    try {
      // Последнее время проверки должно быть не меньше этого
      const secondsAgo = 30;
      const dateToCheck = new Date(new Date().getTime() - secondsAgo * 1000);

      const data = await PriceAlertModel
        .find(
          {
            $or: [
              { lastCheckedAt: null },
              { lastCheckedAt: { $lte: dateToCheck } }
            ]
          },
          { symbol: 1 })
        .sort({ lastCheckedAt: 1 })
        .limit(number)
        .lean();
      const allSymbols = data.map(elem => elem.symbol);
      const uniqSymbols = Array.from(new Set(allSymbols));

      rs(uniqSymbols);
    } catch (e) {
      rj(e);
    }
  });
}

// Вернет массив сработавших алертов
export function checkAlerts ({ symbol, price }: ICheckAlertsParams): Promise<PriceAlertItem[]> {
  return new Promise(async (rs, rj) => {
    try {
      if (!symbol || !price) {
        throw new Error(`[checkAlerts] Не хватает входных данных ${symbol} ${price}`);
      }

      const triggeredAlerts = await PriceAlertModel.find({
        symbol: symbol.toUpperCase(),
        $or: [
          { lowerThen: { $gte: price } },
          { greaterThen: { $lte: price } }
        ]
      });

      // Актуализируем timestamp о последней проверке
      await PriceAlertModel.updateMany({ symbol }, { $set: { lastCheckedAt: new Date() } });

      rs(triggeredAlerts);
    } catch (e) {
      rj(e);
    }
  });
}

// TODO: Сделать отдельные методы для получения алертов по разным параметрам.
//  Что бы делать проверку на входные данные и случайно не вернуть лишнего.
export function getAlerts ({ symbol, user, _id }: RemoveOrGetAlertParams): Promise<PriceAlertItem[]> {
  return new Promise(async (rs, rj) => {
    try {
      const params: RemoveOrGetAlertParams = {};

      symbol && (params.symbol = symbol.toUpperCase());
      user && (params.user = user);
      _id && (params._id = _id);

      const alerts = await PriceAlertModel.find(params);

      rs(alerts);
    } catch (e) {
      rj(e);
    }
  });
}

export async function getAllAlerts (): Promise<PriceAlertItem[]> {
  try {
    const alerts = await PriceAlertModel.find({});

    return alerts;
  } catch (e) {
    throw new Error(e);
  }
}

export function removePriceAlert ({ symbol, _id, user }: RemoveOrGetAlertParams): Promise<number> {
  return new Promise(async (rs, rj) => {
    try {
      const params: RemoveOrGetAlertParams = {};

      symbol && (params.symbol = symbol.toUpperCase());
      user && (params.user = user);
      _id && (params._id = _id);

      if (!Object.keys(params).length) {
        rj('Не указанны параметры');
        return;
      }

      const { deletedCount } = await PriceAlertModel.deleteMany(params);

      rs(deletedCount);
    } catch (e) {
      rj(e);
    }
  });
}

// Вернет массив сработавших алертов
export function updateAlert ({ _id, data }: { _id: string, data: { message: string } }): Promise<any> {
  return new Promise(async (rs, rj) => {
    try {
      const result = await PriceAlertModel.update({ _id }, { $set: data });

      rs(result);
    } catch (e) {
      rj(e);
    }
  });
}

interface GetAlertsCountForUserParams {
  user: number
}

export const getAlertsCountForUser = (user: number) => new Promise(async (rs, rj) => {
  try {
    const params: GetAlertsCountForUserParams = { user };
    const alertsCount = await PriceAlertModel.find(params).count();

    rs(alertsCount);
  } catch (e) {
    rj(e);
  }
});
