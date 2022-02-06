import { MarketInstrument } from '@tinkoff/invest-openapi-js-sdk/build/domain';
import { getModelForClass, prop } from '@typegoose/typegoose';
import { Modify } from 'Modify';

import { RemoveOrGetAlertParams } from './PriceAlert';

interface ShiftEventDataItem {
  currentPrice: number
  maxPrice: number
  minPrice: number
  growPercent: number
  fallPercent: number
  sumVolume: number
  instrument: MarketInstrument
}

export interface ShiftsData {
  [key: string]: ShiftEventDataItem[]
}

export class ShiftEvents {
  @prop({ required: true })
  user: number;

  @prop({ required: true })
  time: number;

  @prop({ required: true })
  days: number;

  @prop({ required: true })
  targetPercent: number;

  @prop({ required: true })
  data: ShiftsData;

  // FIXME: Поле необязательно до тех пор пока есть уведомления без них
  @prop({ required: false })
  forDay: number;

  // День за которые собраны данные
  // FIXME: Поле необязательно до тех пор пока есть уведомления без них
  @prop({ required: false })
  dayOfWeek: number;

  // FIXME: Поле необязательно до тех пор пока есть уведомления без них
  @prop({ required: false })
  wasSent: boolean;
}

export const ShiftEventsModel = getModelForClass(ShiftEvents, {
  schemaOptions: { timestamps: true },
  options: {
    customName: 'shiftevents'
  }
});

export interface ShiftEventItem {
  _id?: string
  user: number
  time: number
  days: number
  targetPercent: number
  /**
     * День для которого создаем оповещение
     * Берем день месяца. Следовательно история будет храниться только за месяц.
     */
  forDay: number

  /**
   * День недели за который был сбор данных
   */
  dayOfWeek: number
  /**
   * Признак того, что данные отправили юзеру
   */
  wasSent: boolean
  data: {
    [key: string]: ShiftEventDataItem[]
  }
}

export function createShiftEvents (items: ShiftEventItem[]): Promise<null> {
  return new Promise(async (rs, rj) => {
    try {
      await ShiftEventsModel.create(items);

      rs();
    } catch (e) {
      rj(e);
    }
  });
}

type ShiftEventItemFindParams = Modify<ShiftEventItem, {
  // eslint-disable-next-line @typescript-eslint/ban-types
  time: object | number
}>;

/**
 * Присылает по времени события по указанному времени и меньше (что бы точно не пропустить что-нибудь)
 */
export async function getShiftEvents ({ time, wasSent }: Partial<ShiftEventItem>): Promise<ShiftEventItem[]> {
  const params: Partial<ShiftEventItemFindParams> = {
    time: { $lte: time },
    // forDay,
    wasSent
  };

  const shifts = await ShiftEventsModel.find(params).lean();

  return shifts;
}

export function removeShiftEvent ({ _id, user }: Partial<ShiftEventItem>): Promise<number> {
  return new Promise(async (rs, rj) => {
    try {
      const params: RemoveOrGetAlertParams = {};

      user && (params.user = user);
      _id && (params._id = _id);

      if (!Object.keys(params).length) {
        rj('Не указанны параметры');
        return;
      }

      const { deletedCount } = await ShiftEventsModel.deleteMany(params);

      rs(deletedCount);
    } catch (e) {
      rj(e);
    }
  });
}
