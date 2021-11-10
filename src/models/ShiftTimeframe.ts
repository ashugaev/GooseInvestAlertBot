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

  /**
   * Будет показано в сообщении алерта (1 неделю, 1 минуту)
   */
  @prop({ required: true })
  name_ru_plur: string

  @prop({ required: true })
  timeframe: string

  /**
   * Время жизни свечи в миллисекундах
   */
  @prop({ required: true })
  lifetime: number
}

export const ShiftTimeframeModel = getModelForClass(ShiftTimeframe, {
  schemaOptions: { timestamps: true }
})

export const getShiftTimeframesObject = async () => {
  const timeframes = await ShiftTimeframeModel.find().lean()

  // Нормализуем таймфреймы в объект для удобства
  const timeframesObj = timeframes.reduce((acc, el) => {
    acc[el.timeframe] = el

    return acc
  }, {})

  return timeframesObj
}
