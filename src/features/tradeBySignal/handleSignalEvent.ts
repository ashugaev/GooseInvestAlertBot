import { NewMessageEvent } from 'telegram/events'
import { Api } from 'telegram/tl'

import {
  normalizeAndFilterMessages,
  saveChatsToDB,
} from '@/bots/cryptoSignals/commands/analyse/analyse.utils'
import { monitorConfigByChannelId } from '@/bots/cryptoSignals/configs/configByChat'
import { SignalChatModel } from '@/bots/cryptoSignals/models/signalChat'

const channelsToTrack = Object.keys(monitorConfigByChannelId)

export const handleSignalEvent = async (event: NewMessageEvent) => {
  const idString = event.chatId.valueOf().toString()

  if (
    event.isChannel &&
    (channelsToTrack.some((el) => el.includes(idString)) ||
      // @ts-ignore
      channelsToTrack.includes(event.message.chat?.username))
  ) {
    // @ts-ignore
    handleMessage(event.message, idString, event)
  }
}

async function handleMessage(
  message: Api.Message,
  channelId: string,
  event: NewMessageEvent
) {
  // 1 Ручной валидатор
  // 2 ai валидатор
  // 3 Создание сделкив очереди
  // 4 Отправка сообщения в чат

  let chat = await SignalChatModel.findOne({
    chatId: Number(channelId),
  }).lean()

  if (!chat) {
    const fetchedChat = await event.message.getChat()
    await saveChatsToDB([fetchedChat])
    chat = await SignalChatModel.findOne({
      chatId: Number(channelId),
    }).lean()
  }

  // If chat not configured it will be skipped
  const [normilizedMessage] = normalizeAndFilterMessages([message], chat)
  // Ai analyze messages
}
