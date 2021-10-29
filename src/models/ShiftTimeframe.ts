/**
 * Отслеживание скорости изменения цены
 */

import { prop, getModelForClass } from '@typegoose/typegoose'

export class ShiftTimeframe {
  /**
   * name поддерживает разные языки, по этому есть призка к локали
   */
  @prop({ required: true })
  name_ru: string

  @prop({ required: true })
  timeframe: string
}

export const ShiftTimeframeModel = getModelForClass(ShiftTimeframe, {
  schemaOptions: { timestamps: true }
})
