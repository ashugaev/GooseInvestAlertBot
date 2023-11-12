import { getModelForClass, prop } from '@typegoose/typegoose'

import { handleMessage } from '@/features/pumpDetect/handleMessage'
import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'
import { EMarketDataSources } from '@/marketApi/types'

export type TrackChatPurpose = 'signal' | 'pump'

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

// Deprecated?
export const callbacksByChatPurpose: Record<
  TrackChatPurpose,
  { message: (params: TrackChatCallbacksParams) => void }
> = {
  signal: {
    message: handleMessage,
  },
  pump: {
    message: () => {
      console.log('pupm message')
    },
  },
}

/**
 * Tracked chats list
 * FIXME: Duplicate with SignalChat
 */
export class TradeByChat {
  @prop({ required: true })
  chatId: string

  @prop({ required: false, default: 'signal' })
  purpose: TrackChatPurpose

  /**
   * Which stock marked this chat created for
   * Potentially can be autodetected
   */
  @prop({ required: true, enum: EMarketDataSources })
  targetSource: EMarketDataSources

  @prop({ required: true, type: () => Number, default: [] })
  manualTP: number[]

  @prop({ required: true, default: null })
  manualSL: number
}

export const TradeByChatModel = getModelForClass(TradeByChat, {
  schemaOptions: { timestamps: true },
})
