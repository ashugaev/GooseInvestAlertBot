/**
 * Tracking the rate of price change
 */

import { getModelForClass, prop } from '@typegoose/typegoose'
import { FilterQuery } from 'mongoose'

export class TimeShift {
  _id: string

  /**
   * Id used to look up ticker data (decoupled from the ticker name)
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
   * Track upward movement
   */
  @prop({ required: true })
  growAlerts: boolean

  /**
   * Track downward movement
   */
  @prop({ required: true })
  fallAlerts: boolean

  /**
   * Start time of the candle for which a fall alert was sent
   * Used to send at most one alert per candle
   */
  @prop({ required: false })
  lastMessageCandleGrowTime: number

  /**
   * Start time of the candle for which a growth alert was sent
   * Used to send at most one alert per candle
   */
  @prop({ required: false })
  lastMessageCandleFallTime: number

  /**
   * Full instrument name
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

type GetTimeshiftsParams = {
  user: number | string
  chat?: number | string
  botId: number
}

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
  botId,
}: GetTimeshiftsParams): Promise<number> => {
  if (!user && !chat) {
    throw new Error('No user or chat')
  }

  const params = {
    botId,
    user,
  }

  chat && (params['chat'] = chat)

  const shiftsCount = await TimeShiftModel.find(params).count()

  return shiftsCount
}

export const getUniqTimeShiftTickers = async () => {
  const data = await TimeShiftModel.find({}, { ticker: 1 }).lean()

  return data
}
