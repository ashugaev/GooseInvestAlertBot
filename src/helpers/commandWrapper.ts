import { log } from './log'
import { TelegrafContext } from 'telegraf/typings/context'
import { Middleware } from 'telegraf'

export function commandWrapper (callback):Middleware<TelegrafContext> {
  return (ctx) => {
    try {
      callback(ctx)
    } catch (e) {
      ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      log.error(e)
    }
  }
}
