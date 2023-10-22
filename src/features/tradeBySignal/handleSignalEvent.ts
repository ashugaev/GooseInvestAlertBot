import { NewMessageEvent } from 'telegram/events'

import { configByChannelId } from '@/bots/cryptoSignals/configs/configByChat'

const channelsToTrack = Object.keys(configByChannelId)

export const handleSignalEvent = async (event: NewMessageEvent) => {
  if (event.isChannel && channelsToTrack.includes(event.chatId.toString())) {
    // handleMessage(message, [], chat)
  }
}

function handleMessage() {
  // 1 Ручной валидатор
  // 2 ai валидатор
  // 3 Создание сделкив очереди
  // 4 Отправка сообщения в чат
}
