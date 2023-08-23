import { TelegramClient } from 'telegram'
const Papa = require('papaparse')

import {
  SignalChat,
  SignalChatModel,
} from '@/bots/cryptoSignals/models/signalChat'
import { initialSignalValidation } from '@/features/signals/devochkiChannel/handleMessage'
import { log } from '@/helpers'
import { wait } from '@/helpers/wait'
import { signalsClient } from '@/integrations/telegram/client'
import { getBotsAndChannels } from '@/integrations/telegram/getAvailableChats'
import { getChatHistory } from '@/integrations/telegram/getChatHistory'
import { User } from '@/models'
const { format } = require('date-fns')

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
      title: chat.title,
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
  message
    ?.replace(/\n(.)/g, (_, anySymbol) => '. ' + anySymbol.toUpperCase())
    .trim()

export const defaultSignalCheckMessagesFilter = (message) => {
  const text = normalizeSignalMessage(message.message)
  if (!initialSignalValidation(text) || text.length < 10) {
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
  })

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

export const generateTableWithSignals = async (messages): Promise<Buffer> => {
  const rows = messages.map((message) => ({
    date: format(new Date(message.date * 1000), 'dd.MM.yyyy'),
    message: message.message,
  }))

  const csvString = Papa.unparse(rows, {
    fields: [
      { label: 'Date', value: 'date', headerStyle: 'font-weight:bold' },
      { label: 'Message', value: 'message', headerStyle: 'font-weight:bold' },
    ],
    header: true,
  })

  return Buffer.from(csvString, 'utf-8')
}
