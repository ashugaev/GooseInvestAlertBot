/**
 * Отслеживание скорости изменения цены
 */

import { getModelForClass, prop } from '@typegoose/typegoose'
import { FilterQuery } from 'mongoose'

export class TimeShift {
  _id: string

  /**
   * Id по которому ищу данные тикера (отвязываемся от названия тикера)
   */
  @prop({ required: true })
  tickerId: string

  @prop({ required: true })
  percent: number

  @prop({ required: true })
  ticker: string

  @prop({ required: true })
  timeframe: string

  /**
   * Need this if no 'chat'
   */
  @prop({ required: true })
  user: number | string

  /**
   * Need this if no 'user'
   */
  @prop({ required: false, default: null })
  chat: number | string

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
   * Время начала свечи за которую был отправлен алерт на падение
   * Нужно для того, что бы слать алерт раз за свечу
   */
  @prop({ required: false })
  lastMessageCandleGrowTime: number

  /**
   * Время начала свечи за которую был отправлен алерт на рост
   * Нужно для того, что бы слать алерт раз за свечу
   */
  @prop({ required: false })
  lastMessageCandleFallTime: number

  /**
   * Полное название инструмента
   */
  @prop({ required: true })
  name: string

  @prop({ required: true, unique: false, index: true })
  botId: number
}

// Get User model
export const TimeShiftModel = getModelForClass(TimeShift, {
  schemaOptions: { timestamps: true },
})

type GetTimeshiftsParams =
  | { user: number | string; chat?: number | string }
  | { chat: number | string; user?: number | string }

export const getTimeShifts = async ({
  user,
  chat,
  ...params
}: Partial<TimeShift>) => {
  if (!user && !chat && !params._id) {
    throw new Error('No user or chat or id in params')
  }

  let reqParams: FilterQuery<TimeShift> = {
    user,
  }

  if (chat) {
    reqParams.chat = chat
  } else {
    // If not id field must be null or not exists
    reqParams.chat = { $eq: null }
  }

  reqParams = { ...reqParams, ...params }

  // @ts-ignore
  const data = await TimeShiftModel.find(reqParams).lean()

  return data
}

export const getTimeShiftsCount = async ({
  user,
  chat,
}: GetTimeshiftsParams): Promise<number> => {
  let shiftsCount = null

  if (chat) {
    shiftsCount = await TimeShiftModel.find({ chat }).count()
  } else if (user) {
    shiftsCount = await TimeShiftModel.find({ user }).count()
  } else {
    throw new Error('No user or chat')
  }

  return shiftsCount
}

export const getUniqTimeShiftTickers = async () => {
  const data = await TimeShiftModel.find({}, { ticker: 1 }).lean()

  return data
}
