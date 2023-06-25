import { Context, Telegraf } from 'telegraf'

import { getAdminOffButton } from '@/menu/getAdminAttachedMenu'

import { commandWrapper } from '../helpers/commandWrapper'

export function setupHelp(bot: Telegraf<Context>) {
  bot.command(
    ['help'],
    commandWrapper({ availableForAdmins: true }, async (ctx) => {
      if (ctx.dbuser.adminMode) {
        await ctx.replyWithHTML(ctx.i18n.t('adminHelp'), {
          disable_web_page_preview: true,
          ...getAdminOffButton(),
        })
      } else {
        await ctx.replyWithHTML(ctx.i18n.t('help'), {
          disable_web_page_preview: true,
        })
      }
    })
  )
}
