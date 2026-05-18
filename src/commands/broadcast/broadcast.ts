import { Context, Telegraf } from 'telegraf'

import { BROADCAST_SCENES } from '@/commands/broadcast/broadcast.constants'
import { commandWrapper } from '@/helpers/commandWrapper'

export function setupBroadcast(bot: Telegraf<Context>) {
  bot.command(
    ['broadcast'],
    commandWrapper(
      { bossOnly: true, availableForAdmins: false },
      async (ctx) => {
        // @ts-ignore
        await ctx.scene.enter(BROADCAST_SCENES.main)
      }
    )
  )
}
