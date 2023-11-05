import { Api, TelegramClient } from 'telegram'

import { log } from '@/helpers'

const {
  SESSION_STRING,
  TELEGRAM_API_HASH,
  TELEGRAM_API_ID,
  TELEGRAM_ANN_API_ID,
  TELEGRAM_ANN_SESSION_STRING,
  TELEGRAM_ANN_API_HASH,
  TELEGRAM_SIGNALS_API_ID,
  TELEGRAM_SIGNALS_API_HASH,
  TELEGRAM_SIGNALS_SESSION_STRING,
} = process.env

export const getChatHistory = async ({
  cl,
  nameOrId,
  tillDate,
}: {
  cl: TelegramClient
  nameOrId: string
  tillDate: Date
}) => {
  const unixTillDate = Math.floor(tillDate.getTime() / 1000)
  const batchSize = 100
  const allMessages = []

  let offsetId = 0

  while (true) {
    let messages = []

    try {
      const result = await cl.invoke(
        new Api.messages.GetHistory({
          peer: nameOrId,
          limit: batchSize,
          offsetId: offsetId,
        })
      )
      // @ts-ignore
      messages = result.messages
    } catch (err) {
      log.error('No access to chat anymore', nameOrId)
    }

    if (messages.length === 0) {
      break
    }

    // Если дата последнего сообщения меньше указанной крайней
    //  То фильтруем только те которые в диапазоне
    if (messages[messages.length - 1].date < unixTillDate) {
      allMessages.push(
        ...messages.filter((message) => {
          return message.date >= unixTillDate
        })
      )
      break
    } else {
      allMessages.push(...messages)
    }

    offsetId = messages[messages.length - 1].id

    log.info('Fetched for:', nameOrId)
  }

  return allMessages
}
