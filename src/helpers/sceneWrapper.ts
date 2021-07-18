import { log } from './log'
import { i18n } from './i18n'
import { addAnalyticsToReply, chb_m } from './analytics'
import { Middleware } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'

export function sceneWrapper (intent: string, callback: (ctx) => void):Middleware<TelegrafContext> {
  return (ctx) => {
    try {
      addAnalyticsToReply(ctx)
      chb_m({ ctx, intent })

      callback(ctx)
    } catch (e) {
      ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
      log.error(e)
    }
  }
}
