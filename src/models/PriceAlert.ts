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
  tickerId?: string
  _id?: string
}

export class PriceAlert {
  _id: string;

  /**
   * Id по по которому ищем данные о цене (отвязываемся от названия тикера)
   */
  @prop({ required: true })
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
  /**
   * id тикера
   */
  id: string
  price: number
}

// Get PriceAlertModel model
export const PriceAlertModel = getModelForClass(PriceAlert, {
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

/**
 * Вернет из базы указанное кол-во уникальных id тикеров, которые давно не проверялись
 *
 * @param number - кол-во, которое нужно проверять. Вернется по факту после схлопывания меньше.
 */
export const getUniqOutdatedAlertsIds = async (number: number): Promise<string[]> => {
  // Вернем тикеры, которые проверялись больше чем "secondsAgo" назад
  const secondsAgo = 30;
  const dateToCheck = new Date(new Date().getTime() - secondsAgo * 1000);

  const data = await PriceAlertModel
    .find(
      {
        $or: [
          { lastCheckedAt: null },
          { lastCheckedAt: { $lte: dateToCheck } }
        ],
        tickerId: { $exists: true }
      },
      { tickerId: 1 })
    .sort({ lastCheckedAt: 1 })
    .limit(number * 3)
    .lean();
  const allIds = data.map(elem => elem.tickerId);
  const uniqIds = Array.from(new Set(allIds));

  return uniqIds;
};

export const setLastCheckedAt = async (tickerId: string): Promise<void> => {
  // Актуализируем timestamp о последней проверке
  await PriceAlertModel.updateMany({ tickerId: tickerId }, { $set: { lastCheckedAt: new Date() } });
};

/**
 * Вернет массив сработавших алертов
 */
export const checkAlerts = async ({ id, price }: ICheckAlertsParams): Promise<PriceAlertItem[]> => {
  if (!id || !price) {
    throw new Error(`[checkAlerts] Не хватает входных данных ${id} ${price}`);
  }

  const triggeredAlerts = await PriceAlertModel.find({
    tickerId: id,
    $or: [
      { lowerThen: { $gte: price } },
      { greaterThen: { $lte: price } }
    ]
  });

  // Актуализируем timestamp о последней проверке
  await PriceAlertModel.updateMany({ tickerId: id }, { $set: { lastCheckedAt: new Date() } });

  return triggeredAlerts;
};

// TODO: Сделать отдельные методы для получения алертов по разным параметрам.
//  Что бы делать проверку на входные данные и случайно не вернуть лишнего.
export const getAlerts = async ({ symbol, user, _id, tickerId }: RemoveOrGetAlertParams): Promise<PriceAlertItem[]> => {
  const params: RemoveOrGetAlertParams = {};

  symbol && (params.symbol = symbol.toUpperCase());
  tickerId && (params.tickerId = tickerId);
  user && (params.user = user);
  _id && (params._id = _id);

  const alerts = await PriceAlertModel.find(params).lean();

  return alerts;
};

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
