import {log} from "@/helpers"
import {isApproximatelyRoundedToHour} from "@/helpers/time/isTimeApproximatelyRoundedToOneHour"
import {TrackChatCallbacksParams} from "@/models/TrackChat"

const STICKERS = {
  sharkSell: '336920350212228888'
}

const detectorsByChatUsername = {
  'Whales_Pumping_Cryptocurrency': {
    start: (params: TrackChatCallbacksParams): string | null => {
      const matched = params.message?.match(/^SELECTED COIN IS \$([A-Z]+)$/)
      const ticker = matched?.[1]
      if(ticker) {
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
    }
  }
}

export const handleMessage = (params: TrackChatCallbacksParams) => {
  // FIXME: Return this !!!
  const chatDetectors = detectorsByChatUsername[params.chatLinkName]
  
  // FIXME: REmove this !!!
  // const chatDetectors = detectorsByChatUsername['Whales_Pumping_Cryptocurrency']
  
  if (chatDetectors) {
    const startData = chatDetectors.start(params)

    // Time of drops most of the time targeted on specific hour
    if(startData && isApproximatelyRoundedToHour(params.messageSentDate, 30)) {
      /// Buy if we don't have opened position
      const ticker = startData
    }
    
    const endData = chatDetectors.end(params)
    
    if(endData) {
      /// Sell if we still have opened position
    }
  } else {
    log.error('No detector for chat ' + params.chatLinkName)
  }
}