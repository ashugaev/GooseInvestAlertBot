import { Api } from 'telegram'
import { NewMessage, NewMessageEvent } from 'telegram/events'

import { logPrefix } from '@/features/pumpDetect/pumpDetect.constants'
import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'
import { log } from '@/helpers'
import { wait } from '@/helpers/wait'
import { client } from '@/integrations/telegram/client'
import {
  callbacksByChatPurpose,
  TrackChatCallbacksParams,
} from '@/models/TrackChat'

async function handleEvent(event: NewMessageEvent) {
  const data = event.message

  try {
    if (event.isChannel) {
      const res: TrackChatCallbacksParams = {
        message: data.message ?? null,
        chatId: data.chatId.toString(),
        // @ts-ignore
        chatTitle: data.chat.username,
        // @ts-ignore
        chatLinkName: data.chat.username,
        views: data.views,
        forwards: data.forwards,
        messageId: data.id,
        messageSentDate: new Date(data.date * 1000),
        // @ts-ignore
        stickerId: data.sticker?.id.toString() ?? null,
      }

      // FIXME: Hardcoded for now. Must depend on chat purpose
      callbacksByChatPurpose.pump.message(res)
    }
  } catch (e) {
    log.error(e)
  }
}

// Test delays
export const pollingMessagesCheck = async () => {
  const delayBetweenRequests = 1000
  let startIterationTime = 0
  let lastHandledMessageId = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      startIterationTime = Date.now()

      const result = await client.invoke(
        new Api.messages.GetHistory({
          peer: 'DefiUniverse',
          limit: 1,
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
  // TODO: Use configuration in bot interface
  // const trackChats = await TrackChatModel.find().lean()

  const trackChats: ChannelsToTrack[] = [
    'keklolkeklolkeklolkeklolkeklol',
    'Whales_Pumping_Cryptocurrency',
    'DefiUniverse',
  ]

  // Track chat events
  client.addEventHandler(
    handleEvent,
    new NewMessage({
      chats: trackChats,
    })
  )

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
