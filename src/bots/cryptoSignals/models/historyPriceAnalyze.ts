import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose'

import { SignalChat } from '@/bots/cryptoSignals/models/signalChat'

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class HistoryPriceAnalyze {
  @prop({ required: true, ref: () => SignalChat })
  chat: Ref<SignalChat>

  @prop({ required: true })
  message: string

  @prop({ required: true })
  messageId: number

  // @prop({ required: true, ref: () => SignalAiRecognize })
  // aiAnswer: Ref<SignalAiRecognize>

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
  status?: string

  /**
   * If tp or sl wasn't triggered during N days
   */
  @prop({ required: true })
  skippedBecauseOfPeriod: boolean
}

export const HistoryPriceAnalyzeModel = getModelForClass(HistoryPriceAnalyze)
