/**
 * Свечи, которые нужная для работы алгоритма измерения скорости
 */

import { prop, getModelForClass } from '@typegoose/typegoose'

export class ShiftCandle {
  /**
   * Максимальная цена
   */
  @prop({ required: true })
  h: number

  /**
   * Цена открытия
   */
  @prop({ required: true })
  o: number

  /**
   * Минимальная цена
   */
  @prop({ required: true })
  l: number

  @prop({ required: true })
  ticker: string

  @prop({ required: true })
  timeframe: string

  @prop({ required: true })
  createdAt: number

  @prop({ required: true })
  updatedAt: number
}

export const ShiftCandleModel = getModelForClass(ShiftCandle)
