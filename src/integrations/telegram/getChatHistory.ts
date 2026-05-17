import { Api, TelegramClient } from 'telegram'

import { log } from '@/helpers'

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

    // If the last message in the batch is older than the cutoff, keep only
    // messages within the requested date range and stop paging.
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
