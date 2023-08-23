import { Api, TelegramClient } from 'telegram'

import Dialog = Api.Dialog

export async function getBotsAndChannels({
  client,
}: {
  client: TelegramClient
}) {
  const botsAndChannels = []

  const allDialogs = await client.getDialogs()

  const filteredDialogs = allDialogs.filter(
    // @ts-ignore
    (dialog) => !dialog.isUser && !dialog.isGroup && dialog.isChannel
  )

  botsAndChannels.push(...filteredDialogs)

  return botsAndChannels
}
