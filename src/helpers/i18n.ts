import Telegraf, { Context } from 'telegraf'
import I18N from 'telegraf-i18n'
const dirtyI18N = require('telegraf-i18n')

export const i18n = new dirtyI18N({
  directory: `${__dirname}/../../locales`,
  defaultLanguage: 'ru',
  sessionName: 'session',
  useSession: false,
  allowMissing: false,
}) as I18N

export function setupI18N(bot: Telegraf<Context>) {
  bot.use(i18n.middleware())
  bot.use((ctx, next) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyI18N = ctx.i18n as any
    anyI18N.locale(ctx.dbuser.language)
    next()
  })
}
