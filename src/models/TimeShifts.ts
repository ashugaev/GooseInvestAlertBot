/**
 * Отслеживание скорости изменения цены
 */

import { prop, getModelForClass } from '@typegoose/typegoose'

export class TimeShift {
  @prop({ required: true })
  percent: number

  @prop({ required: true })
  ticker: string

  @prop({ required: true })
  timeframe: string

  @prop({ required: true })
  user: number
}

// Get User model
export const TimeShiftModel = getModelForClass(TimeShift, {
  schemaOptions: { timestamps: true },
})

export const getTimeShiftsCountForUser = async (user: number): Promise<number> => {
  const params: Partial<TimeShift> = { user }
  const shiftsCount = await TimeShiftModel.find(params).count()

  return shiftsCount
}