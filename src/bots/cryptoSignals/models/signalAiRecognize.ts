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
    ticker?: string
    doubts?: SignalDoubts
    type?: SignalType
    /**
     * Точка входа в сделку
     */
    tradeStartPrice?: number
    volume?: number
    orderType?: SignalOrderType
    stop?: number
    tp?: number[]
  }

  /**
   * Hash of prompt for chat gpt
   * If we have same input and this hash,
   * we can skip chat gpt validation and use previous result
   */
  @prop({ required: true, default: null })
  promptHash?: string

  @prop({ required: false, default: null })
  status?: string
}

export const SignalAiRecognizeModel = getModelForClass(SignalAiRecognize)
