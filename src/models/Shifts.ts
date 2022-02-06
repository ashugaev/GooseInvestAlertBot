import { getModelForClass, prop } from '@typegoose/typegoose';

/**
 * Статистика
 */
export class Shift {
  @prop({ required: true })
  time: number;

  @prop({ required: true })
  timeZone: number;

  @prop({ required: true })
  percent: number;

  @prop({ required: true })
  days: number;

  @prop({ required: true })
  user: number;
}

// Get User model
const ShiftModel = getModelForClass(Shift, {
  schemaOptions: { timestamps: true },
  options: {
    customName: 'shifts'
  }
});

interface ShiftItem {
  user: number
  time: number
  percent: number
  days: number
  timeZone: number
}

export const createShift = async ({ percent, time, user, days, timeZone }: ShiftItem) => {
  await ShiftModel.create({ user, time, percent, days, timeZone });
};

export const getAllShifts = async () => {
  const shifts = await ShiftModel.find();

  return shifts;
};

export const getShiftsCountForUser = async (user: number) => {
  const params: Partial<ShiftItem> = { user };
  const shiftsCount = await ShiftModel.find(params).count();

  return shiftsCount;
};

export const getShiftsForUser = async (user: number) => {
  const params: Partial<ShiftItem> = { user };
  const shiftsCount = await ShiftModel.find(params);

  return shiftsCount;
};

export const removeShiftById = async (id: string) => {
  const params = { _id: id };
  await ShiftModel.remove(params);
};
