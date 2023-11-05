import {
  SignalAiRecognize,
  SignalAiRecognizeModel,
} from '@/bots/cryptoSignals/models/signalAiRecognize'
import {
  chatGptRequestHash,
  validateWithChatGPT,
} from '@/features/signals/devochkiChannel/gpt'
import { log } from '@/helpers'
import { SignalDoubts, SignalType } from '@/models/Signal'

interface ParseSignalWithChatGptParams {
  messageText: string
  messageId: number
  channelId: number
}

export const parseSignalWithChatGpt = async ({
  messageText,
  messageId,
  channelId,
}: ParseSignalWithChatGptParams): Promise<SignalAiRecognize> => {
  let aiRes = ''

  // Fetch prev answer
  const chatGptResFromDb = await SignalAiRecognizeModel.findOne({
    messageId,
    channelId,
    promptHash: chatGptRequestHash,
  }).lean()

  // If answer already exists - return it
  if (chatGptResFromDb?.chatGptValidationMessage?.length) {
    return chatGptResFromDb
  } else {
    aiRes = await validateWithChatGPT(messageText)

    const newItem = new SignalAiRecognizeModel({
      channelId: channelId,
      message: messageText,
      messageId: messageId,
      promptHash: chatGptRequestHash,
      aiExtractedData: {},
      chatGptValidationMessage: aiRes,
    })

    let aiResArr

    try {
      // TODO: Migrate to object
      aiResArr = JSON.parse(aiRes.replace(/'/g, '"'))
    } catch (e) {
      log.error('Can not parse chat gpt answer', e)
      newItem.status = "Can't recognize chat gpt answer"
    }

    if (aiResArr.length) {
      // eslint-disable-next-line prefer-const
      let [ticker, level, tp, stop, type = 'buy', doubts]: [
        string | null,
        number | null,
        number[] | null,
        number | null,
        SignalType | null,
        SignalDoubts | null
      ] = aiResArr

      // Иногда chatGpt отдает num вместо array
      if (Number(tp)) {
        tp = [Number(tp)]
      }

      // Validate answer
      if (
        !ticker?.length ||
        !(level > 0 || level === null) ||
        !(tp?.length || level === null) ||
        !(stop > 0 || stop === null) ||
        !type?.match(/(buy|sell)/) ||
        !doubts?.match(/(yes|no)/)
      ) {
        newItem.status = 'AI answer is invalid'
        return null
      }

      newItem.aiExtractedData.doubts = doubts
      newItem.aiExtractedData.type = type
      newItem.aiExtractedData.stop = stop
      newItem.aiExtractedData.tp = tp
      newItem.aiExtractedData.ticker = ticker
      newItem.aiExtractedData.tradeStartPrice = level
    } else {
      newItem.status = 'AI answer is empty'
      log.error('AI answer is empty')
      return null
    }

    // Async for make it faster
    newItem.save()
    return newItem
  }
}
