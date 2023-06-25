import { Context, Telegraf } from 'telegraf'

import { removeMyBotAction } from '@/commands/mytoken/mytoken.actions'
import {
  MY_TOKEN_ACTIONS,
  MY_TOKEN_SCENE,
} from '@/commands/mytoken/mytoken.constants'
import { commandWrapper } from '@/helpers/commandWrapper'
import { triggerActionRegexp } from '@/helpers/triggerActionRegexp'

export function setupMyToken(bot: Telegraf<Context>) {
  bot.command(
    ['mytoken'],
    commandWrapper(
      {
        availableForAdmins: true,
        availableForUsers: false,
      },
      async (ctx) => {
        // @ts-ignore
        await ctx.scene.enter(MY_TOKEN_SCENE)
      }
    )
  )

  bot.action(triggerActionRegexp(MY_TOKEN_ACTIONS.remove), removeMyBotAction)
}
