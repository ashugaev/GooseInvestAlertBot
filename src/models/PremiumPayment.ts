// eslint-disable-next-line
import { getModelForClass, prop } from '@typegoose/typegoose'

/**
 * Bot subscription data
 *
 * TODO: Create this record when the subscription message is shown
 *  Track the number of impressions and the impression trigger
 */
export class PremiumPaymentRequest {
  @prop({ required: true, unique: false })
  userId: number

  /**
   * When the invoice was issued
   */
  @prop({ required: true })
  issueDate: Date

  @prop({ required: true })
  amount: number

  @prop({ required: true })
  subscriptionType: string

  /**
   * Time when the subscription was paid
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
   * The user sent the transaction hash
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
