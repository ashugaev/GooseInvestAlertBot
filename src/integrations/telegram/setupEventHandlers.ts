import { Api } from 'telegram'
import { NewMessage, NewMessageEvent } from 'telegram/events'

import { logPrefix } from '@/features/pumpDetect/pumpDetect.constants'
import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'
import { handleDevochkiChannelMessage } from '@/features/signals/devochkiChannel/handleMessage'
import { log } from '@/helpers'
import { wait } from '@/helpers/wait'
import { annClient, client } from '@/integrations/telegram/client'
import {
  callbacksByChatPurpose,
  TrackChatCallbacksParams,
} from '@/models/TrackChat'

const trackChatsAnn = [
  // Devochki crypto dev
  1966120775,
  // Devochki crypto prod
  1979914009,
]

const trackChats: ChannelsToTrack[] = [
  'Whales_Pumping_Cryptocurrency',
  'DefiUniverse',
  'keklolkeklolkeklolkeklolkeklol',
]

export type TrackChatsAnn = (typeof trackChatsAnn)[number]

const normalizeMessage = (
  message: Api.Message,
  chat: Api.Chat
): TrackChatCallbacksParams => {
  return {
    message: message.message ?? null,
    chatId: message.chatId.toString(),
    // @ts-ignore
    chatTitle: chat?.title ?? null,
    // @ts-ignore
    chatLinkName: chat?.username ?? null,
    views: message.views,
    forwards: message.forwards,
    messageId: message.id,
    messageSentDate: new Date(message.date * 1000),
    // @ts-ignore
    stickerId: message.sticker?.id.toString() ?? null,
  }
}

// @ts-ignore
const callbackByChat: Record<
  ChannelsToTrack | TrackChatsAnn,
  (data: TrackChatCallbacksParams) => void
> = {
  keklolkeklolkeklolkeklolkeklol: handleDevochkiChannelMessage,
  '-1001966120775': handleDevochkiChannelMessage,
  '-1001979914009': handleDevochkiChannelMessage,
  Whales_Pumping_Cryptocurrency: callbacksByChatPurpose.signal.message,
  DefiUniverse: callbacksByChatPurpose.signal.message,
}

const handleMessage = (
  message: Api.Message,
  prevMessages: Api.Message[] = [],
  chat: Api.Chat
) => {
  // @ts-ignore
  const username = chat?.username ?? null

  const res: TrackChatCallbacksParams = {
    ...normalizeMessage(message, chat),
    prevMessages: prevMessages.map((msg) => normalizeMessage(msg, chat)),
  }

  if (callbackByChat[username]) {
    callbackByChat[username](res)

    return
  }

  const chatId = message.chatId.toString()

  callbackByChat[chatId](res)
}

async function handleEvent(event: NewMessageEvent) {
  const message = event.message

  // TODO: Better to cache this data
  const chat = await event.message.getChat()

  try {
    if (event.isChannel) {
      // @ts-ignore
      handleMessage(message, [], chat)
    }
  } catch (e) {
    log.error(e)
  }
}

const pollingChat = null
// const pollingChat: ChannelsToTrack = 'DefiUniverse'
// const pollingChat: ChannelsToTrack = 'keklolkeklolkeklolkeklolkeklol'

/**
 * Need for analysing history of messages
 */
export const pollingMessagesCheck = async () => {
  const delayBetweenRequests = 1000
  let startIterationTime = 0
  let lastHandledMessageId = 0

  if (!pollingChat) {
    return
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      startIterationTime = Date.now()

      const result = await client.invoke(
        new Api.messages.GetHistory({
          peer: pollingChat,
          limit: 2,
        })
      )

      // @ts-ignore
      const lastMessage = result.messages[0]
      const lastMessageId = lastMessage.id
      const lastMessageText = lastMessage.message
      const lastMessageDate = new Date(lastMessage.date * 1000)

      if (lastHandledMessageId !== lastMessageId) {
        log.info(
          logPrefix,
          'Polling test. Delay in message fetch in sec: ',
          (Date.now() - lastMessageDate.getTime()) / 1000
        )
        log.info(logPrefix, 'Text: ', lastMessageText)

        // @ts-ignore
        handleMessage(lastMessage, result.messages.slice(1), pollingChat)

        lastHandledMessageId = lastMessageId
      }

      // Round iteration time to 1 sec
      const delay = delayBetweenRequests - (Date.now() - startIterationTime)
      delay > 0 && (await wait(delay))
    } catch (e) {
      log.error(logPrefix, 'Polling test errro', e)
    }
  }
}

export const setupEventHandlers = async () => {
  // Track chat events
  client.addEventHandler(
    handleEvent,
    new NewMessage({
      chats: trackChats,
    })
  )

  // Track chat events
  annClient.addEventHandler(
    handleEvent,
    new NewMessage({
      chats: trackChatsAnn,
    })
  )

  // Polling for debug hooks
  pollingMessagesCheck()
}

export const addNewEventHandler = async (username: string) => {
  // Track chat events
  client.addEventHandler(
    handleEvent,
    new NewMessage({
      chats: [username],
    })
  )
}
