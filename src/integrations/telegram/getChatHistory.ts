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
  let offsetDate = unixTillDate

  while (true) {
    const result = await cl.invoke(
      new Api.messages.GetHistory({
        peer: nameOrId,
        limit: batchSize,
        offsetDate: offsetDate,
        offsetId: offsetId,
      })
    )

    // @ts-ignore
    const messages = result.messages

    if (messages.length === 0) {
      break
    }

    allMessages.push(...messages)

    offsetId = messages[messages.length - 1].id
    offsetDate = messages[messages.length - 1].date

    log.info('Fetched for:', nameOrId, '. Untill date:', offsetDate)
  }

  return allMessages
}
