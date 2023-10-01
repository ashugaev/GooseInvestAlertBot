import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

import { configByChannelId } from '@/bots/cryptoSignals/configs/configByChat'

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

  updatedAt?: Date
}

export const getChatsWithConifg = async () => {
  const channels = await SignalChatModel.find().sort({ title: 1 }).lean()
  const channelsWithConfig = Object.keys(configByChannelId).map(Number)

  const items = channels.filter((el) => channelsWithConfig.includes(el.chatId))

  return items
}

export const SignalChatModel = getModelForClass(SignalChat)
