// eslint-disable-next-line
import { getModelForClass, prop } from '@typegoose/typegoose'

/**
 * Данные о подписке на бота
 */
export class PremiumPayment {
  @prop({ required: true, unique: false })
  userId: number

  /**
   * Когда был выставлен счет
   */
  @prop({ required: true })
  issueDate: Date

  @prop({ required: true })
  amount: number

  @prop({ required: true })
  subscriptionType: string

  /**
   * Время когда была оплачена подписка
   */
  @prop({ required: false })
  paidDate: Date

  @prop({ required: true })
  paymentId: string

  @prop({ required: true })
  monthsCount: number
}

export const PremiumPaymentModel = getModelForClass(PremiumPayment, {
  schemaOptions: { timestamps: true },
})
