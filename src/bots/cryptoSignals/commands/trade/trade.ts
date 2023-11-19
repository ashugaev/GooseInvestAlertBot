import { Context, Telegraf } from 'telegraf'

import { askNewTradeChat } from '@/bots/cryptoSignals/commands/trade/trade.scenes'
import { commandWrapper } from '@/helpers/commandWrapper'

export function setupTradeCommand(bot: Telegraf<Context>) {
  bot.command(
    ['trade'],
    commandWrapper(
      {
        availableForAdmins: true,
        availableForUsers: true,
        bossOnly: true,
      },
      async (ctx) => {
        // @ts-ignore
        askNewTradeChat.startScene(ctx)
        // @ts-ignore
        // await askNewTradeChat.startScene(ctx)
      }
    )
  )

  // askNewTradeChat.init({ bot })
}
