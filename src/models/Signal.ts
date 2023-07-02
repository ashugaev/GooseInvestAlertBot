/**
 * Typegoose model for Signal
 */
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'

export type SignalValidationStatus =
  | 'notStarted'
  | 'manualCheckFailed'
  | 'aiCheckFailed'
  | 'aiAnswerInvalid'
  | 'valid'
  | 'rejected'
  | 'AICheckFailed'

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class Signal extends TimeStamps {
  @prop({ required: true })
  channel: ChannelsToTrack

  @prop({ required: true })
  message: string

  @prop({ required: true })
  messageId: number

  @prop({ required: true })
  validationStatus: SignalValidationStatus

  @prop({ required: false })
  chatGptValidationMessage?: string

  @prop({ required: false })
  doubts?: 'yes' | 'no'

  @prop({ required: false })
  type?: 'buy' | 'sell'
}

export const SignalModel = getModelForClass(Signal)
