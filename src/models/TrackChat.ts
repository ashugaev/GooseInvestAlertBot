import { getModelForClass, prop } from '@typegoose/typegoose'

import { handleMessage } from '@/features/pumpDetect/handleMessage'
import { EMarketDataSources } from '@/marketApi/types'

export type TrackChatPurpose = 'pump' | 'news'

export interface TrackChatCallbacksParams {
  message: string | null
  chatId: string
  chatTitle: string
  chatLinkName: string
  views: number
  forwards: number
  messageId: number
  messageSentDate: Date
  stickerId: string | null
}

export const callbacksByChatPurpose: Record<
  TrackChatPurpose,
  { message: (params: TrackChatCallbacksParams) => void }
> = {
  pump: {
    message: handleMessage,
  },
  news: {
    message: () => {
      console.log('news message')
    },
  },
}

/**
 * Tracked chats list
 */
export class TrackChat {
  @prop({ required: true })
  username: string

  @prop({ required: true, enum: ['pump', 'news'] })
  purpose: TrackChatPurpose

  /**
   * Which stock marked this chat created for
   * Possibly only for pumps
   */
  @prop({ required: true, enum: EMarketDataSources })
  targetSource: EMarketDataSources
}

export const TrackChatModel = getModelForClass(TrackChat, {
  schemaOptions: { timestamps: true },
})
