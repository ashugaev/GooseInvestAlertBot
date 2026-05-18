/**
 * Candles required for the velocity measurement algorithm
 */

import { getModelForClass, prop } from '@typegoose/typegoose'

export class ShiftCandle {
  /**
   * Highest price
   */
  @prop({ required: true })
  h: number

  /**
   * Open price
   */
  @prop({ required: true })
  o: number

  /**
   * Lowest price
   */
  @prop({ required: true })
  l: number

  @prop({ required: true })
  tickerId: string

  @prop({ required: true })
  timeframe: string

  @prop({ required: true })
  createdAt: number

  @prop({ required: true })
  updatedAt: number
}

export const ShiftCandleModel = getModelForClass(ShiftCandle)
