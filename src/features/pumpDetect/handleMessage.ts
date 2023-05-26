import {log} from "@/helpers"
import {sayToBoss} from "@/helpers/sayToBoss"
import {isApproximatelyRoundedToHour} from "@/helpers/time/isTimeApproximatelyRoundedToOneHour"
import {accountsList} from "@/marketApi/kucoin/accountsList"
import {tradeWithKucoin} from "@/marketApi/kucoin/trade"
import {TrackChatCallbacksParams} from "@/models/TrackChat"

require('dotenv').config()

const logPrefix = '[handleMessage]'

const STICKERS = {
  sharkSell: '336920350212228888'
}

const isTestMode = process.env.NODE_ENV === 'development'

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
  },
  // Debug chat
  'keklolkeklolkeklolkeklolkeklol': {
    start: (params: TrackChatCallbacksParams): string | null => {
      return detectorsByChatUsername.Whales_Pumping_Cryptocurrency.start(params)
    },
    end: (params): boolean => {
      return detectorsByChatUsername.Whales_Pumping_Cryptocurrency.end(params)
    }
  }
}

type ChannelsToTrack =  keyof typeof detectorsByChatUsername

const configByChannel: Record<ChannelsToTrack, { allowedUTCHours: number[], mustBeRoundHour: boolean }> = {
  Whales_Pumping_Cryptocurrency: {
    allowedUTCHours: [],
    mustBeRoundHour: true
  },
  keklolkeklolkeklolkeklolkeklol: {
    allowedUTCHours: [],
    mustBeRoundHour: true
  }
}

/**
 * @fixme check if time of update is approximately same with time of message
 */
export const handleMessage = async (params: TrackChatCallbacksParams) => {
  log.info(handleMessage, 'Handling message', params)

  // FIXME: Return this !!!
  const chatDetectors = detectorsByChatUsername[params.chatLinkName]
  
  // FIXME: REmove this !!!
  // const chatDetectors = detectorsByChatUsername['Whales_Pumping_Cryptocurrency']
  
  if (chatDetectors) {
    const startData = chatDetectors.start(params)

    // Time of drops most of the time targeted on specific hour
    if(
      startData && 
        // If message date is approximately rounded to hour
        (isApproximatelyRoundedToHour(params.messageSentDate, 30) || isTestMode) &&
        // We don't have any delay more than 15 seconds
        (new Date().getTime() - params.messageSentDate.getTime()) < 15000
    ) {
      /// Buy if we don't have opened position
      const ticker = startData
      const symbol = ticker.toUpperCase() + '-USDT'
      sayToBoss({message: `<b>[SIGNAL]</b> Gonna buy ${ticker}`})
      
      try {
        const res = await tradeWithKucoin({
          symbol,
          side: 'buy',
          remark: 'Trigger:' + params.message,
          funds: 0.11
        })

        const orderId = res.data.orderId

        if(orderId) {
          log.info(logPrefix, 'Trade is done', res)
          sayToBoss({message: `<b>[SIGNAL]</b> Order successful ${ticker}`})
          // Traiding time is 20 sec since got tg message

          const list = await accountsList()
          const account = list.data.find(acc => acc.currency === ticker)

          let timeToCancel = (params.messageSentDate.getTime() + 20000) - new Date().getTime()
          timeToCancel = timeToCancel < 0 ? 0 : timeToCancel

          log.info(logPrefix, 'Time to cancel', timeToCancel)

          if(account) {
            setTimeout(async () => {
              sayToBoss({message: `<b>[SIGNAL]</b> Conna cell ${account.available} ${ticker} for ${ticker}`})

              const res = await tradeWithKucoin({
                size: account.available,
                symbol,
                side: 'sell',
                remark: 'Sell:' + params.message,
              })

              const orderId = res.data.orderId

              if(orderId) {
                sayToBoss({message: `<b>[SIGNAL]</b> Sold ${account.available}${ticker} for ${ticker}`})
              } else {
                sayToBoss({message: `<b>[SIGNAL]</b> Sell problem ${ticker}`})
              }
            }, timeToCancel)
          } else {
            log.error(logPrefix, 'No account for ticker', ticker)
            sayToBoss({message: `<b>[SIGNAL]</b> No account problem. Can't make order ${ticker}`})
          }
        } else {
          sayToBoss({message: `<b>[SIGNAL]</b> Order problem ${ticker}`})
        }
      } catch (e) {
        log.error(logPrefix, 'Trade is creched', e)
        sayToBoss({message: `<b>[SIGNAL]</b> Order problems ${ticker}`})
      }
    }
    
    const endData = chatDetectors.end(params)
    
    if(endData) {
      /// Sell if we still have opened position
      sayToBoss({message: `<b>[SIGNAL]</b> Sell`})
      // Sell all
    }
  } else {
    log.error('No detector for chat ' + params.chatLinkName)
  }
}