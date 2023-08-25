/**
 * Typegoose model for Signal
 */
import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from '@typegoose/typegoose'

export type SignalDoubts = 'yes' | 'no'
export type SignalType = 'buy' | 'sell'
export type SignalOrderType = 'market' | 'limit'

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    timestamps: true,
  },
})
export class SignalAiRecognize {
  @prop({ required: true })
  channelId!: number

  @prop({ required: true })
  message!: string

  @prop({ required: true })
  messageId!: number

  @prop({ required: false, default: null })
  chatGptValidationMessage?: string

  @prop({ required: false, default: {} })
  aiExtractedData!: {
    doubts?: SignalDoubts
    type?: SignalType
    tickerPrice?: number
    volume?: number
    orderType?: SignalOrderType
  }
}

export const SignalAiRecognizeModel = getModelForClass(SignalAiRecognize)
