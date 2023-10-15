import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'
import { AggregatedTrade } from 'binance-api-node'

@modelOptions({
  schemaOptions: {
    timestamps: false,
  },
})
export class BinanceAggTicks implements AggregatedTrade {
  @prop({ required: true, index: true, unique: true })
  aggId: number

  @prop({ required: true })
  symbol: string

  @prop({ required: true })
  price: string

  @prop({ required: true })
  quantity: string

  @prop({ required: true })
  firstId: number

  @prop({ required: true })
  lastId: number

  @prop({ required: true })
  timestamp: number

  @prop({ required: true })
  isBuyerMaker: boolean

  @prop({ required: true })
  wasBestPrice: boolean
}

export const binanceAggTicksModel = getModelForClass(BinanceAggTicks)
