import { Context, Telegraf } from 'telegraf'

import {
  fetchSignalChannelsMessages,
  generateTableWithSignals,
} from '@/bots/cryptoSignals/commands/analyse/analyse.utils'
import { validateWithChatGPT } from '@/features/signals/devochkiChannel/gpt'
import { signalsClient } from '@/integrations/telegram/client'

const chID = -1001720000437

export function setypAnalyseChannelCommand(bot: Telegraf<Context>) {
  bot.on(
    'message',
    // commandWrapper(
    //   { availableForAdmins: true, availableForUsers: true },
    async (ctx) => {
      // TODO: Replate try/catch with commandWrapper
      try {
        // await updateSignalChannels()
        const messages = await fetchSignalChannelsMessages({
          client: signalsClient,
          tillDate: new Date('2023-05-01'),
          channelId: chID,
        })

        try {
          for (const data of messages) {
            const message = data.message
            const aiRes = await validateWithChatGPT(message)
            debugger
          }
        } catch (e) {
          debugger
        }

        const bufferData = await generateTableWithSignals(messages, chID)

        const summaryMessage = 'Found ' + messages.length + ' signal messages'

        await ctx.replyWithHTML(summaryMessage)

        if (bufferData.length > 0) {
          await ctx.replyWithDocument({
            source: bufferData,
            // TODO: ДОбавить название канала и параметры ТП и СЛ
            filename: 'Signals.csv',
          })
        }
      } catch (e) {
        ctx.reply('Error while analysing signals')
      }
    }
    // )
  )
}
