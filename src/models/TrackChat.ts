import {getModelForClass, prop} from '@typegoose/typegoose'

import {handleMessage} from "@/features/pumpDetect/handleMessage"

export type TrackChatPurpose = 'pump' | 'news'

export interface TrackChatCallbacksParams {
    message: string
    chatId: string
    chatTitle: string
    chatLinkName: string
    views: number
    forwards: number
    messageId: number
    messageSentDate: Date
}

export const callbacksByChatPurpose: Record<TrackChatPurpose, { message: (params: TrackChatCallbacksParams) => void }> = {
  'pump': {
    message: handleMessage
  },
  'news': {
    message: () => {
      console.log('news message')
    }
  }
}

/**
 * Tracked chats list
 */
export class TrackChat {
    @prop({required: true})
      username: string

    @prop({required: true, enum: ['pump', 'news']})
      purpose: TrackChatPurpose
}

export const TrackChatModel = getModelForClass(TrackChat, {
  schemaOptions: {timestamps: true},
})
