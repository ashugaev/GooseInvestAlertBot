import { Context, Telegraf } from 'telegraf'

import { PREMUIM_SCENES } from '@/commands/addPremium/addPremium.constants'
import { commandWrapper } from '@/helpers/commandWrapper'

export function setupAddPremium(bot: Telegraf<Context>) {
  bot.command(
    ['premium', 'vip'],
    commandWrapper(
      { bossOnly: true, availableForAdmins: false },
      async (ctx) => {
        // @ts-ignore
        await ctx.scene.enter(PREMUIM_SCENES.add)
      }
    )
  )
}
