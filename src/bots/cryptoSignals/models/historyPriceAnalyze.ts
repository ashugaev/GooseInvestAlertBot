import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose'

import { SignalAiRecognize } from '@/bots/cryptoSignals/models/signalAiRecognize'
import { SignalChat } from '@/bots/cryptoSignals/models/signalChat'
import { SignalMessage } from '@/bots/cryptoSignals/models/signalMessage'

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class HistoryPriceAnalyze {
  @prop({ required: true, ref: () => SignalChat })
  chat: Ref<SignalChat>

  @prop({ required: true, ref: () => SignalMessage })
  message: Ref<SignalMessage>

  @prop({ required: true, ref: () => SignalAiRecognize })
  aiAnswer: Ref<SignalAiRecognize>

  @prop({ required: true })
  signalDate: Date

  @prop({ required: true })
  startPrice: number

  @prop({ required: true })
  startDate: Date

  @prop({ required: true })
  parsedData: Record<any, any>

  @prop({ required: true })
  tpTriggered: boolean

  @prop({ required: true })
  slTriggered: boolean

  @prop({ required: true })
  tpPrice: number

  @prop({ required: true })
  tpDate: Date

  @prop({ required: true })
  slPrice: number

  @prop({ required: true })
  slDate: Date

  @prop({ required: false })
  status: string
}

export const HistoryPriceAnalyzeModel = getModelForClass(HistoryPriceAnalyze)
