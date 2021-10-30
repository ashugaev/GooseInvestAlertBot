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

  @prop({ required: true })
  muted: boolean

  /**
   * Отслеживать рост
   */
  @prop({ required: true })
  growAlerts: boolean

  /**
   * Отслеживать падения
   */
  @prop({ required: true })
  fallAlerts: boolean

  /**
   * Время начала свечи за которую был отправлен алерт
   * Нужно для того, что бы слать алерт раз за свечу
   */
  @prop({ required: false })
  lastMessageCandleTime: number
}

// Get User model
export const TimeShiftModel = getModelForClass(TimeShift, {
  schemaOptions: { timestamps: true }
})

export const getTimeShiftsCountForUser = async (user: number): Promise<number> => {
  const params: Partial<TimeShift> = { user }
  const shiftsCount = await TimeShiftModel.find(params).count()

  return shiftsCount
}

export const getUniqTimeShiftTickers = async () => {
  const data = await TimeShiftModel
    .find({}, { ticker: 1 })
    .lean()

  return data
}
