import { NewMessageEvent } from 'telegram/events'
import { Api } from 'telegram/tl'

import {
  normalizeAndFilterMessages,
  saveChatsToDB,
} from '@/bots/cryptoSignals/commands/analyse/analyse.utils'
import { monitorConfigByChannelId } from '@/bots/cryptoSignals/configs/configByChat'
import { SignalChatModel } from '@/bots/cryptoSignals/models/signalChat'
import { parseSignalWithChatGpt } from '@/bots/cryptoSignals/utils/parseSignalWithChatGpt'
import { autotrader } from '@/modules/autotrader/autotrader'

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
    handleMessage(event.message, Number(idString), event)
  }
}

async function handleMessage(
  message: Api.Message,
  channelId: number,
  event: NewMessageEvent
) {
  // 2 ai валидатор
  // 3 Создание сделкив очереди
  // 4 Отправка сообщения в чат

  if (!message.message?.length) {
    return
  }

  let chat = await SignalChatModel.findOne({
    chatId: channelId,
  }).lean()

  if (!chat) {
    const fetchedChat = await event.message.getChat()
    await saveChatsToDB([fetchedChat])
    chat = await SignalChatModel.findOne({
      chatId: channelId,
    }).lean()
  }

  // If chat not configured it will be skipped
  const [normalizedMessage] = normalizeAndFilterMessages([message], chat)

  if (!normalizedMessage?.message) {
    return
  }

  // Ai analyze messages
  const aiRecognize = await parseSignalWithChatGpt({
    messageText: normalizedMessage.message,
    messageId: normalizedMessage.id,
    channelId: channelId,
  })

  if (!aiRecognize) {
    return
  }

  // @ts-expect-error
  autotrader(aiRecognize)
}
