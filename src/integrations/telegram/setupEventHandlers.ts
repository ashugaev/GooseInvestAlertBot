import { Api } from 'telegram'
import { NewMessage, NewMessageEvent } from 'telegram/events'

import { logPrefix } from '@/features/pumpDetect/pumpDetect.constants'
import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'
import { handleDevochkiChannelMessage } from '@/features/signals/devochkiChannel/handleMessage'
import { log } from '@/helpers'
import { wait } from '@/helpers/wait'
import { client } from '@/integrations/telegram/client'
import {
  callbacksByChatPurpose,
  TrackChatCallbacksParams,
} from '@/models/TrackChat'

const normalizeMessage = (
  message: Api.Message,
  chatLink
): TrackChatCallbacksParams => {
  return {
    message: message.message ?? null,
    chatId: message.chatId.toString(),
    // @ts-ignore
    chatTitle: message.chat?.username ?? chatLink,
    // @ts-ignore
    chatLinkName: message.chat?.username ?? chatLink,
    views: message.views,
    forwards: message.forwards,
    messageId: message.id,
    messageSentDate: new Date(message.date * 1000),
    // @ts-ignore
    stickerId: message.sticker?.id.toString() ?? null,
  }
}

const callbackByChat: Record<
  ChannelsToTrack,
  (data: TrackChatCallbacksParams) => void
> = {
  testSignalsName: handleDevochkiChannelMessage,
  Whales_Pumping_Cryptocurrency: callbacksByChatPurpose.signal.message,
  keklolkeklolkeklolkeklolkeklol: callbacksByChatPurpose.signal.message,
  DefiUniverse: callbacksByChatPurpose.signal.message,
}

const handleMessage = (
  message: Api.Message,
  prevMessages: Api.Message[] = [],
  chatLink: string
) => {
  const res: TrackChatCallbacksParams = {
    ...normalizeMessage(message, chatLink),
    prevMessages: prevMessages.map(normalizeMessage, chatLink),
  }

  callbackByChat[chatLink](res)
}

async function handleEvent(event: NewMessageEvent) {
  const message = event.message

  try {
    if (event.isChannel) {
      // @ts-ignore
      handleMessage(message, [], event.chat.username)
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
  const trackChats: ChannelsToTrack[] = [
    'keklolkeklolkeklolkeklolkeklol',
    'Whales_Pumping_Cryptocurrency',
    'DefiUniverse',
    'testSignalsName',
  ]

  // Track chat events
  client.addEventHandler(
    handleEvent,
    new NewMessage({
      chats: trackChats,
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
