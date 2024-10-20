import { Context, Telegraf } from 'telegraf'

import { REMOVE_SCENE } from '@/commands/remove/remove.constants'
import { commandWrapper } from '@/helpers/commandWrapper'

export function setupRemove(bot: Telegraf<Context>) {
  bot.command(
    ['remove', 'r'],
    commandWrapper({ availableForAdmins: true }, async (ctx) => {
      const { text } = ctx.message

      const removeByTickerMatch = text.match(
        /^\/(remove|r) ([a-zA-Zа-яА-ЯёЁ0-9_]+)$/
      )

      const ticker = removeByTickerMatch ? removeByTickerMatch[2] : null

      // @ts-ignore
      await ctx.scene.enter(REMOVE_SCENE, {
        ticker: ticker?.toUpperCase(),
      })
    })
  )
}
