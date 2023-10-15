import { getModelForClass, modelOptions } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: {
    timestamps: false,
  },
})
export class BinanceAggTicks {}

export const binanceAggTicksModel = getModelForClass(BinanceAggTicks)
