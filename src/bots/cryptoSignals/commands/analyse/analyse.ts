import { Context, Telegraf } from 'telegraf'

import {
  ANALYSE_SCENES,
  channelsPagination,
} from '@/bots/cryptoSignals/commands/analyse/analyse.constants'
import { UserProcessModel } from '@/bots/cryptoSignals/models/userProcess'
import { commandWrapper } from '@/helpers/commandWrapper'

export function setypAnalyseChannelCommand(bot: Telegraf<Context>) {
  bot.command(
    [
      // Correct
      'analyse',
      // Incorrect
      'analyze',
      'analize',
      'analyse',
    ],
    commandWrapper(
      { availableForAdmins: true, availableForUsers: true },
      async (ctx) => {
        const processByUser = await UserProcessModel.findOne({
          userId: ctx.from.id,
        })

        // If have process and it was created less than 1 hour ago
        if (
          processByUser?.userHaveActiveAnalysis &&
          new Date().getTime() - processByUser?.updatedAt.getTime() <
            1000 * 60 * 60 &&
          !(process.env.NODE_ENV === 'development')
        ) {
          await ctx.reply(
            '😱 У тебя есть не завершенный анализ. Попробуй еще раз, после того как получишь отчет'
          )
          return
        }

        // @ts-ignore
        await ctx.scene.enter(ANALYSE_SCENES.init)
      }
    )
  )

  channelsPagination.initActions({
    bot,
  })
}
