import { tradeConfigByChannel } from '@/bots/cryptoSignals/configs/configByChat'
import { detectorsByChatUsername } from '@/features/pumpDetect/detectors'
import { logPrefix } from '@/features/pumpDetect/pumpDetect.constants'
import {
  kucoinFinishTrade,
  kucoinStartTrade,
} from '@/features/pumpDetect/tradeCallbacks/kucoinTradeCallbacks'
import { lbankTradeStart } from '@/features/pumpDetect/tradeCallbacks/lbankTradeCallbacks'
import { log } from '@/helpers'
import { sayToBoss } from '@/helpers/sayToBoss'
import { isApproximatelyRoundedToHour } from '@/helpers/time/isTimeApproximatelyRoundedToOneHour'
import { TrackChatCallbacksParams } from '@/models/TrackChat'

require('dotenv').config()

const lastHandledMessageByChat: Record<string, number> = {}

/**
 * @fixme check if time of update is approximately same with time of message
 */
export const handleMessage = async (params: TrackChatCallbacksParams) => {
  log.info(logPrefix, 'Handling signal message', params)

  // Double check avoiding
  if (lastHandledMessageByChat[params.chatLinkName] === params.messageId) {
    return
  } else {
    lastHandledMessageByChat[params.chatLinkName] = params.messageId
  }

  const chatDetectors = detectorsByChatUsername[params.chatLinkName]
  const chatConfig = tradeConfigByChannel[params.chatLinkName]

  if (chatConfig.debugMessagesTracker) {
    sayToBoss({
      message: `<b>[DEBUG]</b> Channel: ${params.chatLinkName}. Message check: ${params.message}`,
    })
  }

  if (chatDetectors && chatConfig) {
    try {
      const startData = chatDetectors.start(params)

      const hourIsAllowed =
        // If we don't have any hours range restrictions
        (chatConfig.allowedUTCHours === null ||
          chatConfig.allowedUTCHours.includes(new Date().getUTCHours())) &&
        // If message date is approximately rounded to hour
        (chatConfig.mustBeRoundHour
          ? isApproximatelyRoundedToHour(params.messageSentDate, 30)
          : true)

      const timeIsAllowed =
        // We don't have any delay more than 15 seconds
        new Date().getTime() - params.messageSentDate.getTime() < 30000

      log.info(
        logPrefix,
        'Mesage handling delay in seconds:',
        (new Date().getTime() - params.messageSentDate.getTime()) / 1000
      )

      /**
       * Open trade scenario
       */
      if (startData && hourIsAllowed && timeIsAllowed) {
        if (params.chatLinkName === 'Whales_Pumping_Cryptocurrency') {
          await kucoinStartTrade(startData, params, chatConfig)
        } else if (params.chatLinkName === 'keklolkeklolkeklolkeklolkeklol') {
          await lbankTradeStart(params)
        }
      } else {
        log.info(
          logPrefix,
          'Trigger states.',
          'Data:',
          startData,
          'Hour allowed: ',
          hourIsAllowed,
          'Time allowed:',
          timeIsAllowed
        )
      }

      const endData = chatDetectors.end(params)

      if (endData) {
        if (params.chatLinkName === 'Whales_Pumping_Cryptocurrency') {
          await kucoinFinishTrade(params)
        }
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
