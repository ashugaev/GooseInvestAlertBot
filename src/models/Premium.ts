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

  @prop({ required: false })
  isTrial: boolean

  /**
   * Откуда пришел юзер, какие-то теги или еще что-то
   */
  @prop({ required: false })
  marketingSource: string
}

export const PremiumModel = getModelForClass(Premium, {
  schemaOptions: { timestamps: true },
})
