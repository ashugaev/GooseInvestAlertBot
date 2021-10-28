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
