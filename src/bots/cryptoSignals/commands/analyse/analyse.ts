import { Context, Telegraf } from 'telegraf'

import {
  fetchSignalChannelsMessages,
  generateTableWithSignals,
} from '@/bots/cryptoSignals/commands/analyse/analyse.utils'
import { signalsClient } from '@/integrations/telegram/client'

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
          tillDate: new Date('2023-08-15'),
          channelId: -1001720000437,
        })

        const bufferData = await generateTableWithSignals(messages)

        // console.log(
        //   'messages',
        //   messages.map((message) => message.message)
        // )

        const resMessage = 'Found ' + messages.length + ' signal messages'

        await ctx.replyWithHTML(resMessage)
        await ctx.replyWithDocument({
          source: bufferData,
          // TODO: ДОбавить название канала и параметры ТП и СЛ
          filename: 'Signals.csv',
        })
      } catch (e) {
        debugger
      }
    }
    // )
  )
}
