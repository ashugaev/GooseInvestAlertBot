// eslint-disable-next-line
import { getModelForClass, prop } from '@typegoose/typegoose'

/**
 * Данные о подписке на бота
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
   * Откуда пришел юзер, какие-то теги или еще что-то
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
