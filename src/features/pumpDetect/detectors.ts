import { logPrefix } from '@/features/pumpDetect/pumpDetect.constants'
import { ChannelsToTrack } from '@/features/pumpDetect/pumpDetect.types'
import { log } from '@/helpers'
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
      if (
        params.stickerId === STICKERS.Whales_Pumping_Cryptocurrency.sharkSell
      ) {
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
      return detectorsByChatUsername.DefiUniverse.start(params)
    },
    end: (params): boolean => {
      return detectorsByChatUsername.DefiUniverse.end(params)
    },
  },
  DefiUniverse: {
    /**
     * @todo Check 59 min or 29 min
     */
    start: (params: TrackChatCallbacksParams): string | null => {
      if (!params.prevMessages?.length) {
        log.info(logPrefix, 'DefiUniverse: No prev messages')
        return null
      }

      const prevMessage = params.prevMessages[0]
      const isStartPrevMessage = prevMessage.message
        ?.toLowerCase()
        .includes('next name is money')

      const [_, ticker] = params.message.match(/^([a-zA-Z]{2,8})$/) ?? []

      if (isStartPrevMessage && ticker) {
        return ticker.toUpperCase()
      }

      return null
    },
    end: (params): boolean => {
      return false
    },
  },
}
