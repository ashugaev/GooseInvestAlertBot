// eslint-disable-next-line
import { getModelForClass, prop } from '@typegoose/typegoose'

/**
 * Данные о подписке на бота
 */
export class PremiumPayment {
  @prop({ required: true, unique: false })
  userId: number

  /**
   * Когда была оплата
   */
  @prop({ required: true })
  issueDate: Date

  /**
   * Время когда была оплачена подписка
   */
  @prop({ required: false })
  paidDate: Date
}

export const PremiumModel = getModelForClass(PremiumPayment, {
  schemaOptions: { timestamps: true },
})
