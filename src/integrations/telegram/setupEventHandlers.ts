import { NewMessage, NewMessageEvent } from 'telegram/events'

import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'
import { log } from '@/helpers'
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

export const setupEventHandlers = async () => {
  // TODO: Use configuration in bot interface
  // const trackChats = await TrackChatModel.find().lean()

  const trackChats: ChannelsToTrack[] = [
    'keklolkeklolkeklolkeklolkeklol',
    'Whales_Pumping_Cryptocurrency',
  ]

  // Track chat events
  client.addEventHandler(
    handleEvent,
    new NewMessage({
      chats: trackChats,
    })
  )
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
