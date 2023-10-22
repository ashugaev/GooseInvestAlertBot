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
  getChatsWithConifg,
  SignalChat,
  SignalChatModel,
} from '@/bots/cryptoSignals/models/signalChat'
import {
  SignalMessage,
  SignalMessageModel,
} from '@/bots/cryptoSignals/models/signalMessage'
import {
  finishAnalysisForUser,
  UserProcessModel,
} from '@/bots/cryptoSignals/models/userProcess'
import {
  chatGptRequestHash,
  validateWithChatGPT,
} from '@/features/signals/devochkiChannel/gpt'
import { initialSignalValidation } from '@/features/signals/devochkiChannel/handleMessage'
import { log } from '@/helpers'
import { wait } from '@/helpers/wait'
import { signalsClient } from '@/integrations/telegram/client'
import { getBotsAndChannels } from '@/integrations/telegram/getAvailableChats'
import { getChatHistory } from '@/integrations/telegram/getChatHistory'
import { tradeByHistory } from '@/marketApi/binance/api/tradeByHistory/tradeByHistory'
import { User } from '@/models'
import { SignalDoubts, SignalType } from '@/models/Signal'
const { format } = require('date-fns')
import utcToZonedTime from 'date-fns-tz/utcToZonedTime'

import { configByChannelId } from '@/bots/cryptoSignals/configs/configByChat'
import { saveTicks } from '@/bots/cryptoSignals/models/binanceAggTicks'
import { addPercent } from '@/helpers/addPercent'

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
      chatUsername: chat.username,
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

export const normalizeAndFilterMessages = (
  messages: Api.Message[],
  chat: SignalChat
): Api.Message[] => {
  return messages
    .filter(defaultSignalCheckMessagesFilter(chat))
    .map((data) => ({
      ...data,
      message: normalizeSignalMessage(data.message),
    }))
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

    const normalized = normalizeAndFilterMessages(messages)

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
  const rows = messages
    .map((message: Api.Message) => {
      const aiAnswer = aiAnswerByMessageId[message.id]
      const tradeRes = priceAnalysisByMessageId[message.id]

      if (!aiAnswer || !tradeRes) {
        return null
      }

      return {
        // Данные из телеграмма
        'TG | Channel': channel.title || '-',
        'TG | Message Time':
          format(
            utcToZonedTime(new Date(message.date * 1000), 'UTC'),
            'dd.MM.yyyy HH:mm:ss'
          ) || '-',
        'TG | Message': message.message || '-',
        // Данные извеченные из сигнала
        'SIGNAL | Ticker': aiAnswer?.aiExtractedData?.ticker || '-',
        'SIGNAL | Trade Start Price':
          aiAnswer?.aiExtractedData?.tradeStartPrice || '-',
        'SIGNAL | TP Price': aiAnswer?.aiExtractedData?.tp || '-',
        'SIGNAL | SL Price': aiAnswer?.aiExtractedData?.stop || '-',
        'SIGNAL | Volume': aiAnswer?.aiExtractedData?.volume || '-',
        'SIGNAL | Order Type': aiAnswer?.aiExtractedData?.type || '-',
        'SIGNAL | Have Doubts':
          aiAnswer?.aiExtractedData?.doubts === 'yes'
            ? 'YES'
            : aiAnswer?.aiExtractedData?.doubts === 'no'
            ? 'NO'
            : '-',

        // Результаты срабатывания
        'RESULT | Trade finished': tradeRes?.isTradeSuccessfullyFinished || '-',
        'RESULT | Price when message sent':
          tradeRes?.firstAfterMessagePrice || '-',
        'RESULT | Trade start date': tradeRes?.tradeStartDate || '-',
        'RESULT | SL Triggered': tradeRes?.isSLTriggered ? '✅' : '-',
        'RESULT | TP Triggered': tradeRes?.isTPTriggered ? '✅' : '-',
        'RESULT | TP Triggered Date': tradeRes?.tradeTPTriggeredDate
          ? format(
              utcToZonedTime(new Date(tradeRes?.tradeTPTriggeredDate), 'UTC'),
              'dd.MM.yyyy HH:mm:ss'
            )
          : '-',
        'RESULT | SL Triggered Date': tradeRes?.tradeSLTriggeredDate
          ? format(
              utcToZonedTime(tradeRes?.tradeSLTriggeredDate, 'UTC'),
              'dd.MM.yyyy HH:mm:ss'
            )
          : '-',
        'RESULT | SL Autocalculated': tradeRes?.SLwasAutoCalculated
          ? tradeRes?.tradeSLExpectingPrice
          : '-',
        'RESULT | TP Autocalculated': tradeRes?.TPwasAutoCalculated
          ? tradeRes?.tradeTPExpectingPrice
          : '-',
        'RESULT | Deposit change %': tradeRes?.depositChangePercent || '-',
        // Ввод юзера
        'INPUT | TP Percent': tradeRes?.manualInputTPPercent || '-',
        'INPUT | SL Percent': tradeRes?.manualInputSLPercent || '-',
        'INPUT | Use manual TP/SL percent':
          tradeRes?.manualInputPercentOverrideSignalPrice ? 'YES' : 'NO',
        'INPUT | Ignore signals without TP/SL':
          tradeRes?.ignoreSignalsWithoutTPSL ? 'YES' : 'NO',
        'INPUT | Use manual TP/SL percent as fallback for lack of signal TP/SL':
          tradeRes?.manualInputPercentAsFallbackForLackOfSignalTPSL
            ? 'YES'
            : 'NO',
        'INPUT | SL Autocalculated Price':
          (!aiAnswer?.aiExtractedData.stop && tradeRes?.slPrice?.toFixed(4)) ||
          '-',
        // AI
        'AI Answer': aiAnswer?.chatGptValidationMessage || '-',
        // DEBUG
        'DEBUG | Chart Link': tradeRes.tradingViewChartlint || '-',
        'DEBUG | Pine Script': tradeRes.tradingViewPineScrpt || '-',
      }
    })
    .filter(Boolean)

  const csvString = Papa.unparse(rows)

  return Buffer.from(csvString, 'utf-8')
}

export interface GenerateReportByChannelParams {
  channelInd: number
  takeProfitPercent: number
  stopLossPercent: number
  limitForAnalysis: number
  ctx: Context
}

export const generateReportByChannel = async ({
  channelInd,
  takeProfitPercent,
  limitForAnalysis,
  stopLossPercent,
  ctx,
}: GenerateReportByChannelParams) => {
  try {
    const channels = await getChatsWithConifg()
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

    const slicedMessages =
      limitForAnalysis > 0 ? messages.slice(0, limitForAnalysis) : messages

    for (const data of slicedMessages) {
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

            const channelConfig = configByChannelId[channel.chatId]

            const {
              manualInputPercentOverrideSignalPrice,
              ignoreSignalsWithoutTPSL,
              manualInputPercentAsFallbackForLackOfSignalTPSL,
            } = channelConfig

            try {
              const { ticks, ...tradeRes } =
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
                  signalMessageDirection: type,
                })) ?? {}

              // Don't await
              saveTicks(ticks)

              priceAnalysisByMessageId[data.id] = {
                ...tradeRes,
                chat: channel._id,

                message: data.message,
                messageId: data.id,
                signalMessageDate: new Date(data.date * 1000),
                parsedData: newItem.aiExtractedData,

                // priceWhenMessageSent: priceForStartDate,
                ignoreSignalsWithoutTPSL,
                manualInputPercentAsFallbackForLackOfSignalTPSL,
                manualInputPercentOverrideSignalPrice,
                manualInputTPPercent: takeProfitPercent,
                manualInputSLPercent: stopLossPercent,
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
          getMessageByStatus(
            `Recognize and trade ${i}/${slicedMessages.length}`
          ),
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

      // Don't await!
      SignalAiRecognizeModel.bulkWrite(bulkUpdateAiAnswers)
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

      // Don't await!
      HistoryPriceAnalyzeModel.bulkWrite(bulkUpdatePriceAnalysis)
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
    const successfullyTraded = handledSignals.filter(
      (el) => el?.isTradeSuccessfullyFinished
    ).length
    const nonFinishedSignals = handledSignals.filter(
      (el) => !el?.isTradeSuccessfullyFinished
    ).length
    const recognizedSignals = Object.values(aiAnswerByMessageId)

    await ctx.telegram.editMessageText(
      chat.id,
      message_id,
      undefined,
      getMessageByStatus(`Done`, true),
      Extra.HTML(true) as ExtraEditMessage
    )

    const config = configByChannelId[channel.chatId]

    const processInfo = await UserProcessModel.findOne({
      userId: ctx.from.id,
    })
    const timediff = processInfo.updatedAt
      ? (
          (new Date().getTime() - processInfo.updatedAt.getTime()) /
          1000
        ).toFixed(0)
      : 0

    const finalDeposit = handledSignals.reduce((acc, el) => {
      if (el.depositChangePercent) {
        return addPercent(acc, el.depositChangePercent)
      } else {
        return acc
      }
    }, 100)

    const depositChangePercent = (finalDeposit - 100).toFixed(2)

    if (bufferData.length > 0) {
      const summaryMessage = `
        <b>📊 Отчет по каналу ${channel.title}</b>
        
        Прибыль (без комиссии, риск от депозита ${
          cryptoSignals.riskPercentForTradingSimulation * 100
        }%): ${depositChangePercent}%
        
        Сообщений проверенно: ${slicedMessages.length}
        Распознанно сигналов (AI): ${Object.values(aiAnswerByMessageId).length}
        Проверено сигналов: ${handledSignals.length}
        
        Завершенных сделок: ${successfullyTraded}
        Не завершенных сделок: ${nonFinishedSignals}
        
        Сработало SL: ${
          handledSignals.filter((el) => el.isSLTriggered).length
        } (${(
        (handledSignals.filter((el) => el.isSLTriggered).length /
          successfullyTraded) *
        100
      ).toFixed(1)}%)
        Сработало TP: ${
          handledSignals.filter((el) => el.isTPTriggered).length
        } (${(
        (handledSignals.filter((el) => el.isTPTriggered).length /
          successfullyTraded) *
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
        
        Сигналов где взяли свой TP: ${
          handledSignals.filter((el) => el.TPwasAutoCalculated).length
        }  
        Сигналов где взяли свой SL: ${
          handledSignals.filter((el) => el.SLwasAutoCalculated).length
        }

    <b>⚙️ Config</b>
        
        Свой TP/SL : ${
          config.manualInputPercentOverrideSignalPrice ? 'Да' : 'Нет'
        }
        Игнорировать сигналы без TP/SL : ${
          config.ignoreSignalsWithoutTPSL ? 'Да' : 'Нет'
        }
        Использовать свой TP/SL как fallback для сигналов без TP/SL : ${
          config.manualInputPercentAsFallbackForLackOfSignalTPSL ? 'Да' : 'Нет'
        }
        Исключать из отчета не завершенные сделки : ${
          config.removeNotFinished ? 'Да' : 'Нет'
        }

    ⏱️ Time: ${timediff}s
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
    log.error('Error while generating report', e)
    ctx.replyWithHTML('Error while generating report')
  } finally {
    await finishAnalysisForUser(ctx.from.id)
  }
}
