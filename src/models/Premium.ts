// eslint-disable-next-line
import { getModelForClass, prop } from '@typegoose/typegoose'

/**
 * Bot subscription data
 */
export class Premium {
  @prop({ required: true, unique: false })
  userId: number

  @prop({ required: true })
  end: Date

  @prop({ required: true })
  start: Date

  /**
   * @deprecated Use reason
   */
  @prop({ required: false })
  isTrial: boolean

  @prop({ required: false })
  reason: 'manual' | 'trial' | 'pay'

  /**
   * Where the user came from — tags or similar attribution
   */
  @prop({ required: false })
  marketingSource: string

  @prop({ required: false })
  chatId: number

  @prop({ required: false })
  botId: number
}

export const PremiumModel = getModelForClass(Premium, {
  schemaOptions: { timestamps: true, collection: 'premium' },
})
