import { NewMessageEvent } from 'telegram/events'
import { Api } from 'telegram/tl'

import { normalizeAndFilterMessages } from '@/bots/cryptoSignals/commands/analyse/analyse.utils'
import { configByChannelId } from '@/bots/cryptoSignals/configs/configByChat'
import { SignalChatModel } from '@/bots/cryptoSignals/models/signalChat'

const channelsToTrack = Object.keys(configByChannelId)

export const handleSignalEvent = async (event: NewMessageEvent) => {
  if (event.isChannel && channelsToTrack.includes(event.chatId.toString())) {
    // @ts-ignore
    handleMessage(event.message, event.chatId.valueOf())
  }
}

function handleMessage(message: Api.Message, channelId: string) {
  // 1 Ручной валидатор
  // 2 ai валидатор
  // 3 Создание сделкив очереди
  // 4 Отправка сообщения в чат

  const chat = await SignalChatModel.findOne({
    chatId: channelId,
  }).lean()

  const [normilizedMessage] = normalizeAndFilterMessages([message], chat)
}
