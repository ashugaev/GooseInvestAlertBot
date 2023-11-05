/**
 * Typegoose model for Signal
 */
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'

export type SignalDoubts = 'yes' | 'no'
export type SignalType = 'buy' | 'sell'
export type SignalOrderType = 'market' | 'limit'

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})

// TODO: Remove it
export class Signal extends TimeStamps {
  @prop({ required: true })
  channel: ChannelsToTrack

  @prop({ required: true })
  channelId: number

  @prop({ required: true })
  message: string

  @prop({ required: true })
  messageId: number

  /**
   * Any explaining string
   */
  @prop({ required: true })
  status: string

  @prop({ required: false })
  chatGptValidationMessage?: string

  @prop({ required: false })
  doubts?: SignalDoubts

  @prop({ required: false })
  type?: SignalType

  @prop({ required: false })
  tickerPrice?: number

  @prop({ required: false })
  volume?: number

  @prop({ required: false })
  orderType?: SignalOrderType

  @prop({ required: false, default: false })
  orderCreated?: boolean

  @prop({ required: false })
  chatTitle?: string
}

export const SignalModel = getModelForClass(Signal)
