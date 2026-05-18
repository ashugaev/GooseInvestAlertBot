import { Context, Telegraf } from 'telegraf'

import { log } from '@/helpers'
import { commandWrapper } from '@/helpers/commandWrapper'

/**
 * Command for admin purposes
 */
export function setupTest(bot: Telegraf<Context>) {
  const callback = commandWrapper(
    { availableForAdmins: true, bossOnly: true },
    async (_ctx) => {
      try {
        // const res = await newMarkenOrderFuturesBinance({
        //   symbol: 'ATOMUSDT',
        //   quantity: '10',
        // })
      } catch (e) {
        log.error(e)
      }
    }
  )

  bot.command(['test'], callback)
}
