import { getModelForClass, prop } from '@typegoose/typegoose'

import { handleMessage } from '@/features/pumpDetect/handleMessage'
import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'
import { EMarketDataSources } from '@/marketApi/types'

export type TrackChatPurpose = 'signal' | 'news'

export interface TrackChatCallbacksParams {
  message: string | null
  chatId: string
  chatTitle: string
  chatLinkName: ChannelsToTrack
  views: number
  forwards: number
  messageId: number
  messageSentDate: Date
  stickerId: string | null
  prevMessages?: TrackChatCallbacksParams[]
}

export const callbacksByChatPurpose: Record<
  TrackChatPurpose,
  { message: (params: TrackChatCallbacksParams) => void }
> = {
  signal: {
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
