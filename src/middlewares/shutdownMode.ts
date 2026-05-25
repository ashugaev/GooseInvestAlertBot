import { Context } from 'telegraf'

import { getShutdownMessage, isShutdownEnabled } from '@/helpers/shutdownMode'

import { log } from '../helpers/log'

const logPrefix = '[shutdownMode]'

/**
 * When `SHUTDOWN_MODE` is on, intercept every update before any handler,
 * acknowledge it (callback queries need `answerCbQuery` so the spinner stops),
 * and reply once with the shutdown announcement. No `next()` — handlers,
 * scenes and `setupCheckers` callbacks behind this middleware never run.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function shutdownMode(ctx: Context, next: () => any) {
  if (!isShutdownEnabled(process.env)) {
    return next()
  }

  const message = getShutdownMessage(process.env)

  try {
    if (ctx.updateType === 'callback_query') {
      await ctx.answerCbQuery().catch(() => undefined)
    }

    if (ctx.chat) {
      await ctx.reply(message, { disable_web_page_preview: true })
    }
  } catch (e) {
    log.error(logPrefix, e)
  }
}
