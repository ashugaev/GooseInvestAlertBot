import { logPrefixDevochki } from '@/features/signals/devochkiChannel/devochkiChannel.constants'
import { validateWithChatGPT } from '@/features/signals/devochkiChannel/gpt'
import { log } from '@/helpers'
import { SignalModel } from '@/models/Signal'
import { TrackChatCallbacksParams } from '@/models/TrackChat'

export const handleDevochkiChannelMessage = async (
  data: TrackChatCallbacksParams
) => {
  const pattern1 = /#[A-Z]{3,6}/ // ticker
  const pattern2 = /\d+%/ // number
  const pattern3 = /закреп/ // закреп notice
  const pattern4 = /(лонг|шорт)/ // type

  const signalItem = new SignalModel({
    message: data.message,
    messageId: data.messageId,
    channel: data.chatLinkName,
    validationStatus: 'notStarted',
  })

  try {
    if (
      !pattern1.test(data.message) ||
      !pattern2.test(data.message) ||
      !pattern3.test(data.message) ||
      !pattern4.test(data.message) ||
      data.message.length <= 40
    ) {
      signalItem.validationStatus = 'manualCheckFailed'
      throw 'Message is not valid'
      return
    }

    const AIRes = await validateWithChatGPT(data.message)

    if (!AIRes) {
      signalItem.validationStatus = 'aiCheckFailed'
      throw 'AI check failed'
    }

    signalItem.chatGptValidationMessage = AIRes

    let dataArr = null

    try {
      dataArr = JSON.parse(AIRes.replace(/'/g, '"'))
    } catch (e) {
      signalItem.validationStatus = 'aiAnswerInvalid'
      throw 'AI answer json is invalid'
    }

    const [ticker, level, tp, stop, type, doubts] = dataArr

    // Validate answer
    if (
      !ticker.length ||
      !(level > 0) ||
      !tp.length ||
      !tp.every((el) => el > 0) ||
      !(stop > 0) ||
      !type.match(/(buy|sell)/) ||
      !doubts.match(/(yes|no)/)
    ) {
      signalItem.validationStatus = 'aiAnswerInvalid'
      throw 'AI answer is invalid'
    }

    signalItem.doubts = doubts
    signalItem.type = type

    // Get ticker info
    // get price
    // check how much to go untill level
    // Set limit or market order depending on price
    // Смотрим что уже нет активной сделки по этому тикеру
    // Make orders
    // Ожидание закрепления. Отправим с определнным статусом джобу в очередь
    // Stops updater start
  } catch (e) {
    log.info(logPrefixDevochki, e)
  } finally {
    signalItem.save()
  }
}
