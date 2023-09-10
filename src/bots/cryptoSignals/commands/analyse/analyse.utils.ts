import { Api, TelegramClient } from 'telegram'
const Papa = require('papaparse')
import { BulkWriteOperation } from 'mongodb'
import { Context } from 'telegraf'

import { HistoryPriceAnalyze } from '@/bots/cryptoSignals/models/historyPriceAnalyze'
import {
  SignalAiRecognize,
  SignalAiRecognizeModel,
} from '@/bots/cryptoSignals/models/signalAiRecognize'
import {
  SignalChat,
  SignalChatModel,
} from '@/bots/cryptoSignals/models/signalChat'
import {
  SignalMessage,
  SignalMessageModel,
} from '@/bots/cryptoSignals/models/signalMessage'
import {
  chatGptRequestHash,
  validateWithChatGPT,
} from '@/features/signals/devochkiChannel/gpt'
import {
  ConfigForSignalChannel,
  initialSignalValidation,
} from '@/features/signals/devochkiChannel/handleMessage'
import { log } from '@/helpers'
import { wait } from '@/helpers/wait'
import { signalsClient } from '@/integrations/telegram/client'
import { getBotsAndChannels } from '@/integrations/telegram/getAvailableChats'
import { getChatHistory } from '@/integrations/telegram/getChatHistory'
import { getTicks } from '@/marketApi/binance/api/getTicks'
import { User } from '@/models'
import { SignalDoubts, SignalType } from '@/models/Signal'
const { format } = require('date-fns')

// Move to db
const configByChannelId: Record<string, ConfigForSignalChannel> = {
  '-1001720000437': {
    directionRequired: true,
    tickerInBigLetters: true,
    tickerWithHash: false,
    priceRequired: false,
  },
}

function convertToCSV(data) {
  const rows = []

  // Создаем строки CSV из данных
  data.forEach((item) => {
    const values = Object.values(item)
    const escapedValues = values.map((value) => {
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    rows.push(escapedValues.join(','))
  })

  // Объединяем строки в одну строку
  return rows.join('\n')
}

// Ваши данные в формате массива объектов
const yourData = [
  { name: 'John', age: 30, city: 'New York' },
  { name: 'Jane', age: 25, city: 'Los Angeles' },
  // ... остальные данные
]

const csvString = convertToCSV(yourData)

// Преобразуем CSV строку в буфер
const buffer = Buffer.from(csvString, 'utf-8')

// Теперь у вас есть буфер с данными в формате CSV

export const updateSignalChannels = async () => {
  try {
    await wait(500)

    const chats = await getBotsAndChannels({
      client: signalsClient,
    })

    const clientInfo = (await signalsClient.getMe()) as unknown as User

    const normalized: SignalChat[] = chats.map((chat) => ({
      chatId: Number(chat.id),
      title: chat?.title,
      username: chat.username,
      clientId: Number(clientInfo.id),
      clientUsername: clientInfo.username,
    }))

    const dataForBulkUpdate = normalized.map((data) => ({
      updateOne: {
        upsert: true,
        filter: { chatId: data.chatId },
        update: {
          $set: {
            ...data,
          },
        },
      },
    }))

    await SignalChatModel.bulkWrite(dataForBulkUpdate)
  } catch (e) {
    log.error('Error while starting cryptoSignals bot', e)
  }
}

export const normalizeSignalMessage = (message: string): string =>
  message?.replace(/\n/g, ' | ').trim()

export const defaultSignalCheckMessagesFilter = (message) => {
  const text = normalizeSignalMessage(message.message)
  if (
    // TODO: Remove hardcoded channel id
    !initialSignalValidation(text, configByChannelId[-1001720000437]) ||
    text.length < 8
  ) {
    return false
  } else {
    return true
  }
}

export const fetchSignalChannelsMessages = async ({
  tillDate,
  client,
  channelId,
}: {
  tillDate: Date
  client: TelegramClient
  channelId: number
}) => {
  const chats = await SignalChatModel.find({
    monitoringEnabled: true,
    chatId: channelId,
  }).lean()

  await wait(500)

  const filteredAndNormilizedMessages = []

  for (const chat of chats) {
    const messages = await getChatHistory({
      cl: client,
      nameOrId: chat.chatId.toString(),
      tillDate,
    })

    const filtered = messages.filter(defaultSignalCheckMessagesFilter)
    const normalized = filtered.map((data) => ({
      ...data,
      message: normalizeSignalMessage(data.message),
    }))

    filteredAndNormilizedMessages.push(...normalized)
  }

  return filteredAndNormilizedMessages
}

export const generateTableWithSignals = async (
  messages,
  channel: SignalChat,
  aiAnswerByMessageId: Record<number, Partial<SignalAiRecognize>>
): Promise<Buffer> => {
  const maxWidth = 200
  const transform = (value) =>
    value && value.length > maxWidth ? value.substring(0, maxWidth) : value

  const rows = messages.map((message: Api.Message) => ({
    channel: channel.title,
    date: format(new Date(message.date * 1000), 'dd.MM.yyyy'),
    message: message.message,
    ticker: aiAnswerByMessageId[message.id]?.aiExtractedData?.ticker,
    tp: aiAnswerByMessageId[message.id]?.aiExtractedData?.tp,
    stop: aiAnswerByMessageId[message.id]?.aiExtractedData?.stop,
    volume: aiAnswerByMessageId[message.id]?.aiExtractedData?.volume,
    type: aiAnswerByMessageId[message.id]?.aiExtractedData?.type,
    doubts: aiAnswerByMessageId[message.id]?.aiExtractedData?.doubts,
    tickerPrice: aiAnswerByMessageId[message.id]?.aiExtractedData?.tickerPrice,
    aiAnswer:
      aiAnswerByMessageId[message.id.toString()]?.chatGptValidationMessage,
  }))

  const csvString = Papa.unparse(rows, {
    fields: [
      {
        label: 'Date',
        value: 'date',
        headerStyle: 'font-weight:bold',
        transform,
      },
      {
        label: 'Channel',
        value: 'channel',
        headerStyle: 'font-weight:bold',
        transform,
      },
      {
        label: 'Message',
        value: 'message',
        headerStyle: 'font-weight:bold',
        transform,
      },
      {
        label: 'Doubts',
        value: 'doubts',
        headerStyle: 'font-weight:bold',
      },
      {
        label: 'Type',
        value: 'type',
        headerStyle: 'font-weight:bold',
        transform,
      },
      {
        label: 'Make Order Price',
        value: 'tickerPrice',
        headerStyle: 'font-weight:bold',
        transform,
      },
      {
        label: 'Volume',
        value: 'volume',
        headerStyle: 'font-weight:bold',
      },
      {
        label: 'Take Profit',
        value: 'tp',
        headerStyle: 'font-weight:bold',
        transform,
      },
      {
        label: 'Stop Loss',
        value: 'stop',
        headerStyle: 'font-weight:bold',
        transform,
      },
      {
        label: 'Ai Answer',
        value: 'aiAnswer',
        headerStyle: 'font-weight:bold',
        transform,
      },
    ],
    header: true,
  })

  return Buffer.from(csvString, 'utf-8')
}

export interface GenerateReportByChannelParams {
  channelInd: number
  takeProfitPercent: number
  stopLossPercent: number
  ctx: Context
}

export const generateReportByChannel = async ({
  channelInd,
  takeProfitPercent,
  stopLossPercent,
  ctx,
}: GenerateReportByChannelParams) => {
  try {
    const channels = await SignalChatModel.find().lean()
    const channel = channels[channelInd - 1]

    // Временный хардкод
    const dateTill = new Date('2023-08-15')

    const message = await ctx.replyWithHTML(
      `<b>⏳ Генерирую отчет</b>
      
      📊 Канал: ${channel.title} 
      
      🟢 Тейк-профит: ${takeProfitPercent}%
      
      🔴 Стоп-лосс: ${stopLossPercent}%
 
      📅 Анализ начиная с даты: ${format(dateTill, 'dd.MM.yyyy')}
    `
    )

    const messages = await fetchSignalChannelsMessages({
      client: signalsClient,
      tillDate: new Date(dateTill),
      channelId: channel.chatId,
    })

    if (!messages.length) {
      await ctx.replyWithHTML(
        `Не нашел ни одного сообщения в канале ${channel.title}`
      )
      return
    }

    try {
      const bulkMessageUpdate: BulkWriteOperation<SignalMessage>[] =
        messages.map((message) => ({
          updateOne: {
            filter: {
              messageId: message.messageId,
              chatId: channel.chatId,
            },
            update: {
              $set: {
                chatId: channel.chatId,
                chat: channel._id,
                messageId: message.id,
                message: message.message,
                date: message.date * 1000,
              },
            },
            upsert: true, // Insert if the document doesn't exist, update if it does
          },
        }))

      // FIXME: Creating duplicates now
      await SignalMessageModel.bulkWrite(bulkMessageUpdate)

      log.info('Messages saved to DB')
    } catch (e) {
      log.error('Error while saving messages to DB', e)
    }

    const aiAnswerByMessageId: Record<number, Partial<SignalAiRecognize>> = {}
    const priceAnalysisByMessageId: Record<
      number,
      Partial<HistoryPriceAnalyze>
    > = {}

    // FIXME: REMOVE IT BEFORE PRODUCTION
    const messagesLimitedForDebug = messages.slice(0, 3)

    for (const data of messagesLimitedForDebug) {
      try {
        const message = data.message
        const aiRes = await validateWithChatGPT(message)

        const newItem: Partial<SignalAiRecognize> = {
          channelId: channel.chatId,
          message,
          messageId: data.id,
          promptHash: chatGptRequestHash,
          aiExtractedData: {},
        }

        aiAnswerByMessageId[data.id] = newItem

        if (aiRes) {
          newItem.chatGptValidationMessage = aiRes

          let aiResArr

          try {
            aiResArr = JSON.parse(aiRes.replace(/'/g, '"'))
          } catch (e) {
            newItem.status = "Can't recognize chat gpt answer"
          }

          if (aiResArr.length) {
            const [ticker, level, tp, stop, type = 'buy', doubts]: [
              string | null,
              number | null,
              number[] | null,
              number | null,
              SignalType | null,
              SignalDoubts | null
            ] = aiResArr

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
              continue
            }

            newItem.aiExtractedData.doubts = doubts
            newItem.aiExtractedData.type = type
            newItem.aiExtractedData.stop = stop
            newItem.aiExtractedData.tickerPrice = level
            newItem.aiExtractedData.tp = tp
            newItem.aiExtractedData.ticker = ticker

            try {
              const { ticks, closed, tpTriggered, slTriggered } =
                await getTicks({
                  startTime: data.date * 1000,
                  tpPercent: takeProfitPercent,
                  slPercent: stopLossPercent,
                  symbol: ticker,
                })

              // FIXME Check ticks res
              debugger
              // priceAnalysisByMessageId[data.id] = {
              //   ticker,
              // }
            } catch (e) {
              newItem.status = 'Error while getting price'
            }
          }
        }

        log.info('Saving ai answer', newItem)
      } catch (e) {
        log.error('Error while asking ai', e)
      }
    }

    try {
      const aiAnswerByMessageIdArr = Object.values(aiAnswerByMessageId)
      // Bulk update config
      const bulkUpdateAiAnswers: BulkWriteOperation<SignalAiRecognize>[] =
        aiAnswerByMessageIdArr.map((data) => ({
          updateOne: {
            filter: {
              messageId: data.messageId,
              channelId: data.channelId,
              promptHash: data.promptHash,
            },
            update: {
              $set: {
                ...data,
              },
            },
          },
        }))

      await SignalAiRecognizeModel.bulkWrite(bulkUpdateAiAnswers)
    } catch (e) {
      log.error('Error while saving ai answers', e)
    }

    const bufferData = await generateTableWithSignals(
      messages,
      channel,
      aiAnswerByMessageId
    )

    if (bufferData.length > 0) {
      await ctx.replyWithDocument(
        {
          source: bufferData,
          // TODO: ДОбавить название канала и параметры ТП и СЛ
          filename: `Signals_${channel.title}.csv`,
        },
        {
          reply_to_message_id: message.message_id,
        }
      )
    } else {
      await ctx.replyWithHTML('Не нашел ни одного сообщения')
    }
  } catch (e) {
    ctx.replyWithHTML('Error while generating report')
  }
}
