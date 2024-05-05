// eslint-disable-next-line
import { getModelForClass, prop } from '@typegoose/typegoose'

/**
 * Данные о подписке на бота
 */
export class PremiumPaymentRequest {
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

  /**
   * Used only with payment systems
   */
  @prop({ required: false })
  paymentId: string

  @prop({ required: true })
  monthsCount: number

  @prop({ required: true })
  botId: number

  /**
   * Time when paymend was canceled in transaction validation failed
   */
  @prop({ required: false })
  cancelDate: Date

  @prop({ required: false })
  chatId: number

  /**
   * Юзер прислал хеш транзакции
   */
  @prop({ required: false })
  paymentIdAddedDate?: Date
}

export const PremiumPaymentRequestModel = getModelForClass(
  PremiumPaymentRequest,
  {
    schemaOptions: { timestamps: true, collection: 'premium-payments-request' },
  }
)
