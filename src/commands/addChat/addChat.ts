import { Context, Telegraf } from 'telegraf'

import { ADDCHAT_SCENE } from '@/commands/addChat/addChat.constants'
import { commandWrapper } from '@/helpers/commandWrapper'

export function setupAddChat(bot: Telegraf<Context>) {
  bot.command(
    ['addchat'],
    commandWrapper(
      {
        availableForAdmins: true,
        bossOnly: true,
      },
      async (ctx) => {
        // @ts-ignore
        await ctx.scene.enter(ADDCHAT_SCENE)
      }
    )
  )
}
