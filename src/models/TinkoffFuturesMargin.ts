// eslint-disable-next-line
import {getModelForClass, prop} from '@typegoose/typegoose'

/**
 * Вспомогательная таблица для рассчета стоимости фьчерсов в тиньке
 */
export class TinkoffFuturesMargin {
  _id: string

  @prop({ required: true, unique: true })
  tickerId: string

  @prop({ required: true})
  minPriceIncrement: {
    'units': number
    'nano': number
  }

  @prop({ required: true })
  minPriceIncrementAmount: {
    'units': number
    'nano': number
  }
}

export const TinkoffFuturesMarginModel = getModelForClass(TinkoffFuturesMargin, {
  schemaOptions: { timestamps: true }
})
