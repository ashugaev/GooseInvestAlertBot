import { Context, Telegraf } from 'telegraf'

import {
  ANALYSE_SCENES,
  channelsPagination,
} from '@/bots/cryptoSignals/commands/analyse/analyse.constants'
import { commandWrapper } from '@/helpers/commandWrapper'

const chID = -1001720000437

export function setypAnalyseChannelCommand(bot: Telegraf<Context>) {
  bot.command(
    [
      // Correct
      'analyse',
      // Incorrect
      'analyze',
    ],
    commandWrapper(
      { availableForAdmins: true, availableForUsers: true },
      async (ctx) => {
        // @ts-ignore
        await ctx.scene.enter(ANALYSE_SCENES.init)

        // TODO: Replate try/catch with commandWrapper
        //   try {
        //     // await updateSignalChannels()
        //     const messages = await fetchSignalChannelsMessages({
        //       client: signalsClient,
        //       tillDate: new Date('2023-07-01'),
        //       channelId: chID,
        //     })
        //
        //     try {
        //       for (const data of messages) {
        //         const message = data.message
        //         const aiRes = await validateWithChatGPT(message)
        //
        //         const newItem = new SignalAiRecognizeModel({
        //           channelId: chID,
        //           message,
        //           messageId: data.messageId,
        //         })
        //
        // //           if(aiRes) {
        // //                   newItem.aiRes = aiRes
        // //
        // //               let aiResArr
        // //                  try {
        // //                  aiResArr = JSON.parse(aiRes.replace(/'/g, '"'))
        // // } catch (e) {
        // //                       newItem.status = "Can't recognize chat gpt answer"
        // // }
        // //
        // //  if(aiResArr.length) {
        // //
        // //  }
        // //           aiExtractedData: aiRes ? {
        // //              doubts?: SignalDoubts
        // // type?: SignalType
        // // tickerPrice?: number
        // // volume?: number
        // // orderType?: SignalOrderType
        // //           } : {},
        // //           }
        // //       }
        // //     } catch (e) {
        // //       debugger
        // //     }
        //
        //     const bufferData = await generateTableWithSignals(messages, chID)
        //
        //     const summaryMessage = 'Found ' + messages.length + ' signal messages'
        //
        //     await ctx.replyWithHTML(summaryMessage)
        //
        //     if (bufferData.length > 0) {
        //       await ctx.replyWithDocument({
        //         source: bufferData,
        //         // TODO: ДОбавить название канала и параметры ТП и СЛ
        //         filename: 'Signals.csv',
        //       })
        //     }
        //   } catch (e) {
        //     ctx.reply('Error while analysing signals')
        //   }
      }
    )
  )

  channelsPagination.initActions({
    bot,
  })

  // bot.action(
  //   triggerActionRegexp(ANALYSE_ACTIONS.channelsPagination),
  //   shiftAlertSettings
  // )
}
