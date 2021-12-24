import { Middleware } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'

import { addAnalyticsToReply, chb_m } from './analytics'
import { i18n } from './i18n'
import { log } from './log'

export function sceneWrapper (intent: string, callback: (ctx: any) => Promise<void>): Middleware<any> {
  return async (ctx) => {
    try {
      addAnalyticsToReply(ctx)
      chb_m({ ctx, intent })

      await callback(ctx)
    } catch (e) {
      log.error(e)
      await ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }
  }
}
