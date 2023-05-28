import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'
import { TrackChatCallbacksParams } from '@/models/TrackChat'

const STICKERS: Partial<Record<ChannelsToTrack, Record<string, string>>> = {
  Whales_Pumping_Cryptocurrency: {
    sharkSell: '336920350212228888',
  },
}

interface DetectorCallbacks {
  start: (params: TrackChatCallbacksParams) => string | null
  end: (params: TrackChatCallbacksParams) => boolean
  anounce?: (params: TrackChatCallbacksParams) => boolean
}

export const detectorsByChatUsername: Record<
  ChannelsToTrack,
  DetectorCallbacks
> = {
  Whales_Pumping_Cryptocurrency: {
    start: (params: TrackChatCallbacksParams): string | null => {
      const matched = params.message?.match(/^SELECTED COIN IS \$([A-Z]+)$/)
      const ticker = matched?.[1]
      if (ticker) {
        return ticker
      }
      return null
    },
    end: (params): boolean => {
      if (params.stickerId === STICKERS.sharkSell) {
        return true
      }

      if (params.message?.includes('SELL NOW')) {
        return true
      }

      return false
    },
    // Return time before start of the pump
    anounce: () => {
      return false
    },
  },
  // Debug chat
  keklolkeklolkeklolkeklolkeklol: {
    start: (params: TrackChatCallbacksParams): string | null => {
      return detectorsByChatUsername.Whales_Pumping_Cryptocurrency.start(params)
    },
    end: (params): boolean => {
      return detectorsByChatUsername.Whales_Pumping_Cryptocurrency.end(params)
    },
  },
}
