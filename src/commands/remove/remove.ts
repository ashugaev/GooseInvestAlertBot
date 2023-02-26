import { Context, Telegraf } from 'telegraf'

import { REMOVE_SCENE } from '@/commands/remove/remove.constants'
import { commandWrapper } from '@/helpers/commandWrapper'

export function setupRemove (bot: Telegraf<Context>) {
  bot.command(['remove', 'r'], commandWrapper(async ctx => {
    await ctx.scene.enter(REMOVE_SCENE)
  }))
}
