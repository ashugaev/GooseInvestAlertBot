import { logPrefix } from '@/features/pumpDetect/pumpDetect.constants'
import { log } from '@/helpers'
import { TrackChatCallbacksParams } from '@/models/TrackChat'

/**
 * @todo Проверять что есть памп (не на другой бирже)
 */
export const lbankTradeStart = async (params: TrackChatCallbacksParams) => {
  const now = new Date()

  const isTargetMinInTheFuture =
    params.messageSentDate.getMinutes() <= now.getMinutes()

  let remainingMilliseconds =
    60000 - (now.getSeconds() * 1000 + now.getMilliseconds())

  remainingMilliseconds = remainingMilliseconds < 0 ? 0 : remainingMilliseconds

  if (isTargetMinInTheFuture) {
    setTimeout(() => {
      /// Sell lbank
    }, remainingMilliseconds)
  } else {
    log.info(
      logPrefix,
      'Поздно для сделки. Time tg',
      params.messageSentDate.toISOString(),
      'Time now',
      now.toISOString()
    )
  }
}
