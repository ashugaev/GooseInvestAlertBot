import { Context,Telegraf } from 'telegraf'

import { commandWrapper } from '../helpers/commandWrapper'

export function setupHelp (bot: Telegraf<Context>) {
  bot.command(['help'], commandWrapper({availableForAdmins: false},async ctx => {
    ctx.replyWithHTML(ctx.i18n.t('help'),
      { disable_web_page_preview: true }
    )
  }))
}
