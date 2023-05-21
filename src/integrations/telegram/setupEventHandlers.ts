import {NewMessage, NewMessageEvent} from "telegram/events"

import {client} from "@/integrations/telegram/client"
import {callbacksByChatPurpose, TrackChatCallbacksParams, TrackChatModel} from "@/models/TrackChat"

async function handleEvent(event: NewMessageEvent) {
  const data = event.message

  if (event.isChannel) {
    const res: TrackChatCallbacksParams = {
      message: data.message,
      chatId: data.chatId.toString(),
      // @ts-ignore
      chatTitle: data.chat.username,
      // @ts-ignore
      chatLinkName: data.chat.username,
      views: data.views,
      forwards: data.forwards,
      messageId: data.id,
      messageSentDate: new Date(data.date * 1000)
    }

    // FIXME: Hardcoded for now. Must depend on chat purpose
    callbacksByChatPurpose.pump.message(res)
  }
}

export const setupEventHandlers = async () => {
  const trackChats = await TrackChatModel.find().lean()

  // Track chat events
  client.addEventHandler(handleEvent, new NewMessage({
    chats: trackChats.map(chat => chat.username)
  }))
}

export const addNewEventHandler = async (username: string) => {
  // Track chat events
  client.addEventHandler(handleEvent, new NewMessage({
    chats:[username]
  }))
}