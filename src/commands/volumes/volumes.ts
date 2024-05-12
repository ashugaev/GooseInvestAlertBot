import { Context, Telegraf } from 'telegraf'

import { VOLUME_SCENES } from '@/commands/volumes/volumes.constants'
import { commandWrapper } from '@/helpers/commandWrapper'

export function setupVolumes(bot: Telegraf<Context>) {
  bot.command(
    ['volume', 'v', 'volumes'],
    commandWrapper({ availableForAdmins: true }, async (ctx) => {
      // @ts-ignore
      await ctx.scene.enter(VOLUME_SCENES.add)
    })
  )
}
