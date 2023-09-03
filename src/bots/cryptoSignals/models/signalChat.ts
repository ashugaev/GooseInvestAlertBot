import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    customName: 'signalchat',
  },
})
export class SignalChat {
  @prop({ required: true, index: true, unique: true })
  chatId: number

  @prop({ required: true })
  title: string

  @prop({ required: true })
  username?: string

  @prop({ required: true })
  clientId: number

  @prop({ required: true })
  clientUsername: string

  @prop({ required: false, default: false })
  monitoringEnabled?: boolean
}

export const SignalChatModel = getModelForClass(SignalChat)
