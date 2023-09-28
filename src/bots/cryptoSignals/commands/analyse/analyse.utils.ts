import { Api, TelegramClient } from 'telegram'
const Papa = require('papaparse')
import { BulkWriteOperation } from 'mongodb'
import { Context, Extra } from 'telegraf'
import { ExtraEditMessage } from 'telegraf/typings/telegram-types'

import { cryptoSignals } from '@/bots/cryptoSignals/configs/cryptoSignals'
import {
  HistoryPriceAnalyze,
  HistoryPriceAnalyzeModel,
} from '@/bots/cryptoSignals/models/historyPriceAnalyze'
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
import { finishAnalysisForUser } from '@/bots/cryptoSignals/models/userProcess'
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
import { tradeByHistory } from '@/marketApi/binance/api/tradeByHistory/tradeByHistory'
import { User } from '@/models'
import { SignalDoubts, SignalType } from '@/models/Signal'
const { format } = require('date-fns')

// Move to db
const configByChannelId: Record<string, ConfigForSignalChannel> = {
  '-1001720000437': {
    // directionRequired: true,
    // tickerInBigLetters: true,
    // tickerWithHash: false,
    // priceRequired: false,
  },
  '-1001922990972': {
    keyWords: ['Торговая пара', 'Точка входа'],
  },
  '-1001810513504': {
    keyWords: ['СИГНАЛ'],
  },
  '-1001596060097': {
    keyWords: ['Открываю'],
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

    // const folders = await signalsClient.invoke(
    //   new Api.messages.GetDialogFilters(null)
    // )

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

export const defaultSignalCheckMessagesFilter =
  (chat: SignalChat) => (message) => {
    const text = normalizeSignalMessage(message.message)
    if (
      // TODO: Remove hardcoded channel id
      !initialSignalValidation(text, configByChannelId[chat.chatId]) ||
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
    // monitoringEnabled: true,
    chatId: channelId,
  }).lean()

  const filteredAndNormilizedMessages = []

  for (const chat of chats) {
    const messages = await getChatHistory({
      cl: client,
      nameOrId: chat.chatId.toString(),
      tillDate,
    })

    const filtered = messages.filter(defaultSignalCheckMessagesFilter(chat))
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
  aiAnswerByMessageId: Record<number, Partial<SignalAiRecognize>>,
  priceAnalysisByMessageId: Record<number, Partial<HistoryPriceAnalyze>>
): Promise<Buffer> => {
  const maxWidth = 200
  const transform = (value) =>
    value && value.length > maxWidth ? value.substring(0, maxWidth) : value

  const rows = messages.map((message: Api.Message) => ({
    // Данные из телеграмма
    'TG | Channel': channel.title,
    'TG | Message Time': format(
      new Date(message.date * 1000),
      'dd.MM.yyyy HH:mm:ss'
    ),
    'TG | Message': message.message,
    // Данные извеченные из сигнала
    'SIGNAL | Ticker': aiAnswerByMessageId[message.id]?.aiExtractedData?.ticker,
    'SIGNAL | Trade Start Price':
      aiAnswerByMessageId[message.id]?.aiExtractedData?.tradeStartPrice,
    'SIGNAL | TP Price': aiAnswerByMessageId[message.id]?.aiExtractedData?.tp,
    'SIGNAL | SL Price': aiAnswerByMessageId[message.id]?.aiExtractedData?.stop,
    'SIGNAL | Volume': aiAnswerByMessageId[message.id]?.aiExtractedData?.volume,
    'SIGNAL | Order Type':
      aiAnswerByMessageId[message.id]?.aiExtractedData?.type,
    'SIGNAL | Have Doubts':
      aiAnswerByMessageId[message.id]?.aiExtractedData?.doubts === 'yes'
        ? 'YES'
        : aiAnswerByMessageId[message.id]?.aiExtractedData?.doubts === 'no'
        ? 'NO'
        : '',

    // Результаты срабатывания
    'RESULT | Price when message sent':
      priceAnalysisByMessageId[message.id]?.priceWhenMessageSent,
    'RESULT | Trade start date': priceAnalysisByMessageId[message.id]?.startDate
      ? format(
          priceAnalysisByMessageId[message.id]?.startDate,
          'dd.MM.yyyy HH:mm:ss'
        )
      : '',
    'RESULT | SL Triggered': priceAnalysisByMessageId[message.id]?.slTriggered
      ? '✅'
      : '',
    'RESULT | TP Triggered': priceAnalysisByMessageId[message.id]?.tpTriggered
      ? '✅'
      : '',
    'RESULT | TP Triggered Date': priceAnalysisByMessageId[message.id]?.tpDate
      ? format(
          priceAnalysisByMessageId[message.id]?.tpDate,
          'dd.MM.yyyy HH:mm:ss'
        )
      : '',
    'RESULT | SL Triggered Date': priceAnalysisByMessageId[message.id]?.slDate
      ? format(
          priceAnalysisByMessageId[message.id]?.slDate,
          'dd.MM.yyyy HH:mm:ss'
        )
      : '',
    // Ввод юзера
    'INPUT | Start Price By Message Date':
      priceAnalysisByMessageId[message.id]?.isStartPriceDetectedByDate &&
      priceAnalysisByMessageId[message.id]?.startPrice.toFixed(4),
    'INPUT | TP Autocalculated Price':
      (!aiAnswerByMessageId[message.id]?.aiExtractedData.tp &&
        priceAnalysisByMessageId[message.id]?.tpPrice.toFixed(4)) ||
      '',
    'INPUT | SL Autocalculated Price':
      (!aiAnswerByMessageId[message.id]?.aiExtractedData.stop &&
        priceAnalysisByMessageId[message.id]?.slPrice.toFixed(4)) ||
      '',
    // AI
    'AI Answer':
      aiAnswerByMessageId[message.id.toString()]?.chatGptValidationMessage,
  }))

  const csvString = Papa.unparse(rows)

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
    const channels = await SignalChatModel.find().sort({ title: 1 }).lean()
    const channel = channels[channelInd - 1]

    const getMessageByStatus = (status: string, isDone?: boolean) =>
      `<b>${isDone ? '✅' : '⏳'} Генерирую отчет ${
        status?.length ? ': ' + status : ''
      }</b>
      
      📊 Канал: ${channel.title} 
      
      🟢 Тейк-профит: ${takeProfitPercent}%
      
      🔴 Стоп-лосс: ${stopLossPercent}%
 
      📅 Анализ начиная с даты: ${format(cryptoSignals.dateTill, 'dd.MM.yyyy')}
    `

    const { message_id, chat } = await ctx.replyWithHTML(getMessageByStatus(''))

    const messages = await fetchSignalChannelsMessages({
      client: signalsClient,
      tillDate: new Date(cryptoSignals.dateTill),
      channelId: channel.chatId,
    })

    if (!messages.length) {
      await ctx.replyWithHTML(
        `Не нашел ни одного сообщения в канале ${channel.title}`
      )
      return
    }

    await ctx.telegram.editMessageText(
      chat.id,
      message_id,
      undefined,
      getMessageByStatus(`Получил сообщения`),
      Extra.HTML(true) as ExtraEditMessage
    )

    try {
      const bulkMessageUpdate: BulkWriteOperation<SignalMessage>[] =
        messages.map((message) => ({
          updateOne: {
            filter: {
              messageId: Number(message.id),
              chatId: Number(channel.chatId),
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

      await SignalMessageModel.bulkWrite(bulkMessageUpdate)

      log.info('Messages saved to DB')
    } catch (e) {
      log.error('Error while saving messages to DB', e)
    }

    await ctx.telegram.editMessageText(
      chat.id,
      message_id,
      undefined,
      getMessageByStatus(`Сохранил сообщения`),
      Extra.HTML(true) as ExtraEditMessage
    )

    const aiAnswerByMessageId: Record<number, Partial<SignalAiRecognize>> = {}
    const priceAnalysisByMessageId: Record<
      number,
      Partial<HistoryPriceAnalyze>
    > = {}

    let i = 0
    for (const data of messages) {
      try {
        let aiRes = ''

        const chatGptResFromDb = await SignalAiRecognizeModel.findOne({
          messageId: Number(data.id),
          channelId: Number(channel.chatId),
          promptHash: chatGptRequestHash,
        }).lean()

        const message = data.message

        // Prev answer
        if (chatGptResFromDb?.chatGptValidationMessage?.length) {
          aiRes = chatGptResFromDb.chatGptValidationMessage
        } else {
          aiRes = await validateWithChatGPT(message)
        }

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
              continue
            }

            newItem.aiExtractedData.doubts = doubts
            newItem.aiExtractedData.type = type
            newItem.aiExtractedData.stop = stop
            newItem.aiExtractedData.tp = tp
            newItem.aiExtractedData.ticker = ticker
            newItem.aiExtractedData.tradeStartPrice = level

            // TODO: Move to config
            const manualInputPercentOverrideSignalPrice = false
            const ignoreSignalsWithoutTPSL = false
            const manualInputPercentAsFallbackForLackOfSignalTPSL = false

            try {
              const tradeRes =
                (await tradeByHistory({
                  signalMessageTime: data.date * 1000,
                  signalMessageTPValue: tp,
                  signalMessageSLValue: stop,
                  signalMessageSymbol: ticker,
                  signalMessageTradeStartPrice: level,
                  manualInputTPPercent: takeProfitPercent,
                  manualInputSLPercent: stopLossPercent,
                  manualInputPercentOverrideSignalPrice,
                  ignoreSignalsWithoutTPSL,
                  manualInputPercentAsFallbackForLackOfSignalTPSL,
                })) ?? {}

              priceAnalysisByMessageId[data.id] = {
                chat: channel._id,
                message: data.message,
                messageId: data.id,
                signalDate: new Date(data.date * 1000),
                startPrice,
                startDate,
                parsedData: newItem.aiExtractedData,
                tpTriggered,
                slTriggered,
                tpPrice,
                tpDate,
                slPrice,
                slDate,
                isSkippedBecauseOfPeriod,
                isStartPriceDetectedByDate,
                priceWhenMessageSent: priceForStartDate,
                ignoreSignalsWithoutTPSL,
                manualInputPercentAsFallbackForLackOfSignalTPSL,
                manualInputPercentOverrideSignalPrice,
              }
            } catch (e) {
              newItem.status = 'Error while getting price'
            }
          }
        }

        log.info('Saving ai answer', newItem)
      } catch (e) {
        log.error('Error while asking ai', e)
      } finally {
        await ctx.telegram.editMessageText(
          chat.id,
          message_id,
          undefined,
          getMessageByStatus(`Recognize and trade ${i}/${messages.length}`),
          Extra.HTML(true) as ExtraEditMessage
        )
        i++
      }
    }

    let bulkUpdateAiAnswers: BulkWriteOperation<SignalAiRecognize>[] = []

    await ctx.telegram.editMessageText(
      chat.id,
      message_id,
      undefined,
      getMessageByStatus(`Results saving in DB...`),
      Extra.HTML(true) as ExtraEditMessage
    )

    try {
      const aiAnswerByMessageIdArr = Object.values(aiAnswerByMessageId)
      // Bulk update config
      bulkUpdateAiAnswers = aiAnswerByMessageIdArr.map((data) => ({
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
          upsert: true,
        },
      }))

      await SignalAiRecognizeModel.bulkWrite(bulkUpdateAiAnswers)
    } catch (e) {
      log.error('Error while saving ai answers', e)
    }

    // Upload price analysis
    try {
      const bulkUpdatePriceAnalysis: BulkWriteOperation<HistoryPriceAnalyze>[] =
        Object.values(priceAnalysisByMessageId).map((data) => ({
          updateOne: {
            filter: {
              messageId: data.messageId,
              chat: channel._id,
            },
            update: {
              $set: {
                // FIXME: fix this
                // aiAnswer: bulkUpdateAiAnswers.find(el => el.messageId === data.messageId)
                ...data,
              },
            },
            upsert: true,
          },
        }))

      await HistoryPriceAnalyzeModel.bulkWrite(bulkUpdatePriceAnalysis)
    } catch (e) {
      log.error('Error while saving price analysis', e)
    }

    await ctx.telegram.editMessageText(
      chat.id,
      message_id,
      undefined,
      getMessageByStatus(`Results saved in DB`),
      Extra.HTML(true) as ExtraEditMessage
    )

    const bufferData = await generateTableWithSignals(
      messages,
      channel,
      aiAnswerByMessageId,
      priceAnalysisByMessageId
    )

    const handledSignals = Object.values(priceAnalysisByMessageId)
    const recognizedSignals = Object.values(aiAnswerByMessageId)

    await ctx.telegram.editMessageText(
      chat.id,
      message_id,
      undefined,
      getMessageByStatus(`Done`, true),
      Extra.HTML(true) as ExtraEditMessage
    )

    if (bufferData.length > 0) {
      const summaryMessage = `
        <b>📊 Отчет по каналу ${channel.title}</b>
        
        Сообщений проверенно: ${messages.length}
        Распознанно сигналов: ${Object.values(aiAnswerByMessageId).length}
        Обработано сигналов: ${handledSignals.length}
        
        Сработало SL: ${
          handledSignals.filter((el) => el.slTriggered).length
        } (${(
        (handledSignals.filter((el) => el.slTriggered).length /
          handledSignals.length) *
        100
      ).toFixed(1)}%)
        Сработало TP: ${
          handledSignals.filter((el) => el.tpTriggered).length
        } (${(
        (handledSignals.filter((el) => el.tpTriggered).length /
          handledSignals.length) *
        100
      ).toFixed(1)}%)
        
        Сигналов с указанной точкой входа: ${
          recognizedSignals.filter((el) => el.aiExtractedData.tradeStartPrice)
            .length
        }
        Сигналов с указанным TP: ${
          recognizedSignals.filter((el) => el.aiExtractedData.tp).length
        }
        Сигналов с указанным SL: ${
          recognizedSignals.filter((el) => el.aiExtractedData.stop).length
        }
        
        Сигналов где взяли свой TP или SL: ${
          handledSignals.filter(
            (el) =>
              el.tpPrice !==
                aiAnswerByMessageId[el.messageId].aiExtractedData.tp[0] ||
              el.slPrice !==
                aiAnswerByMessageId[el.messageId].aiExtractedData.stop
          ).length
        }
      `
      await ctx.replyWithHTML(summaryMessage)
      await ctx.replyWithDocument(
        {
          source: bufferData,
          filename: `Signals_${channel.title}.csv`,
        },
        {
          reply_to_message_id: message_id,
        }
      )
    } else {
      await ctx.replyWithHTML('Не нашел ни одного сообщения')
    }
  } catch (e) {
    ctx.replyWithHTML('Error while generating report')
  } finally {
    await finishAnalysisForUser(ctx.from.id)
  }
}
