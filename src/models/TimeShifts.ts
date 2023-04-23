/**
 * Отслеживание скорости изменения цены
 */

import {getModelForClass, prop} from '@typegoose/typegoose' // eslint-disable-line unused-imports/no-unused-imports

export class TimeShift {
  _id: string

    /**
     * Id по которому ищу данные тикера (отвязываемся от названия тикера)
     */
    @prop({required: true})
      tickerId: string

    @prop({required: true})
      percent: number

    @prop({required: true})
      ticker: string

    @prop({required: true})
      timeframe: string

    /**
     * Need this if no 'chat'
     */
    @prop({required: true})
      user: number | string

    /**
     * Need this if no 'user'
     */
    @prop({required: false, default: null})
      chat: number | string

    @prop({required: true})
      muted: boolean

    /**
     * Отслеживать рост
     */
    @prop({required: true})
      growAlerts: boolean

    /**
     * Отслеживать падения
     */
    @prop({required: true})
      fallAlerts: boolean

    /**
     * Время начала свечи за которую был отправлен алерт на падение
     * Нужно для того, что бы слать алерт раз за свечу
     */
    @prop({required: false})
      lastMessageCandleGrowTime: number

    /**
     * Время начала свечи за которую был отправлен алерт на рост
     * Нужно для того, что бы слать алерт раз за свечу
     */
    @prop({required: false})
      lastMessageCandleFallTime: number

    /**
     * Полное название инструмента
     */
    @prop({required: true})
      name: string
}

// Get User model
export const TimeShiftModel = getModelForClass(TimeShift, {
  schemaOptions: {timestamps: true}
})

type GetTimeshiftsCountParams = { user: number | string, chat?: number | string } | { chat: number | string, user?: number | string }

export const getTimeShiftsCount = async ({user, chat}: GetTimeshiftsCountParams): Promise<number> => {
  let shiftsCount = null

  if (chat) {
    shiftsCount = await TimeShiftModel.find({chat}).count()
  } else if (user) {
    shiftsCount = await TimeShiftModel.find({user}).count()
  } else {
    throw new Error('No user or chat')
  }

  return shiftsCount
}

export const getUniqTimeShiftTickers = async () => {
  const data = await TimeShiftModel
    .find({}, {ticker: 1})
    .lean()

  return data
}
