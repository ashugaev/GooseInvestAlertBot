import { detectorsByChatUsername } from '@/features/pumpDetect/detectors'
import {
  configByChannel,
  logPrefix,
} from '@/features/pumpDetect/pumpDetect.constants'
import { log } from '@/helpers'
import { sayToBoss } from '@/helpers/sayToBoss'
import { isApproximatelyRoundedToHour } from '@/helpers/time/isTimeApproximatelyRoundedToOneHour'
import { kucoinCellAll } from '@/marketApi/kucoin/sellAll'
import { tradeWithKucoin } from '@/marketApi/kucoin/trade'
import { TrackChatCallbacksParams } from '@/models/TrackChat'

require('dotenv').config()

let lastSymbolTrade = null
let lastTickerTrade = null

/**
 * @fixme check if time of update is approximately same with time of message
 */
export const handleMessage = async (params: TrackChatCallbacksParams) => {
  log.info(logPrefix, 'Handling message', params)

  const chatCallbacks = detectorsByChatUsername[params.chatLinkName]
  const chatConfig = configByChannel[params.chatLinkName]

  if (chatConfig.debugMessagesTracker) {
    sayToBoss({
      message: `<b>[DEBUG]</b> Channel: ${params.chatLinkName}. Message check: ${params.message}`,
    })
  }

  if (chatCallbacks && chatConfig) {
    try {
      const startData = chatCallbacks.start(params)

      const hourIsAllowed =
        // If we don't have any hours range restrictions
        (chatConfig.allowedUTCHours === null ||
          chatConfig.allowedUTCHours.includes(new Date().getUTCHours())) &&
        // If message date is approximately rounded to hour
        (chatConfig.mustBeRoundHour
          ? // TODO: Уменьшить это время после проверки
            isApproximatelyRoundedToHour(params.messageSentDate, 60)
          : true)

      const timeIsAllowed =
        // We don't have any delay more than 15 seconds
        new Date().getTime() - params.messageSentDate.getTime() < 15000

      /**
       * Open trade scenario
       */
      if (startData && hourIsAllowed && timeIsAllowed) {
        const ticker = startData.toUpperCase()
        const symbol = ticker + '-USDT'

        sayToBoss({ message: `<b>[SIGNAL]</b> Gonna buy ${ticker}` })

        await tradeWithKucoin({
          symbol,
          side: 'buy',
          remark: 'Trigger:' + params.message,
          funds: chatConfig.buyAmount,
        })

        sayToBoss({ message: `<b>[SIGNAL]</b> Order successful ${ticker}` })

        let timeToCancel =
          params.messageSentDate.getTime() + 20000 - new Date().getTime()
        timeToCancel = timeToCancel < 0 ? 0 : timeToCancel

        log.info(logPrefix, 'Time to cancel', timeToCancel)

        const cellRes = await kucoinCellAll({
          delay: timeToCancel,
          symbol,
          retries: 3,
          ticker,
          params,
        })

        lastTickerTrade = ticker
        lastSymbolTrade = symbol

        sayToBoss({
          message: `<b>[SIGNAL]</b> Sold ${cellRes.ticker} ${ticker}. Balance ${cellRes.main} USDT`,
        })
      }

      const endData = chatCallbacks.end(params)

      if (endData && lastSymbolTrade && lastTickerTrade) {
        sayToBoss({ message: `<b>[SIGNAL]</b> Sell` })

        const cellRes = await kucoinCellAll({
          delay: 0,
          symbol: lastSymbolTrade,
          retries: 3,
          ticker: lastTickerTrade,
          params,
        })

        lastTickerTrade = null
        lastSymbolTrade = null

        sayToBoss({
          message: `<b>[SIGNAL]</b> Sold ${cellRes.ticker} ${lastTickerTrade}. Balance ${cellRes.main} USDT`,
        })
      }
    } catch (e) {
      log.error(logPrefix, 'Error while handling message', e)
      sayToBoss({
        message: `<b>[SIGNAL]</b> Error while handling message`,
      })
    }
  } else {
    log.info(logPrefix, 'No detector for chat ' + params.chatLinkName)
  }
}
