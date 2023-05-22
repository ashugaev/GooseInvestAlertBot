import {log} from "@/helpers"
import {sayToBoss} from "@/helpers/sayToBoss"
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
    },
    // Return time before start of the pump
    prepare: () => {
      return false
    }
  }
}

/**
 * @fixme check if time of update is approximately same with time of message
 */
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
      sayToBoss({message: `<b>[SIGNAL]</b> Buy ${ticker}`})
    }
    
    const endData = chatDetectors.end(params)
    
    if(endData) {
      /// Sell if we still have opened position
      sayToBoss({message: `<b>[SIGNAL]</b> Sell ${ticker}`})
    }
  } else {
    log.error('No detector for chat ' + params.chatLinkName)
  }
}