import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose'

import { SignalChat } from '@/bots/cryptoSignals/models/signalChat'

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class SignalMessage {
  @prop({ required: true, ref: () => SignalChat })
  chat: Ref<SignalChat>

  @prop({ required: true })
  messageId: number

  @prop({ required: true })
  message: string

  @prop({ required: true })
  date: number
}

export const SignalMessageModel = getModelForClass(SignalMessage)

// // chat and message id must be unique combination
// SignalMessageModel.schema.index({ chat: 1, messageId: 1 }, { unique: true })
