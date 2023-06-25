import { Context } from 'telegraf'

import { i18n } from '@/helpers/i18n'
import { toUserMode } from '@/models'
import { getUserChats } from '@/models/Chat'

export const switchToAdminMode = async (ctx: Context) => {
  const userChats = await getUserChats(ctx.dbuser?.id)

  if (!userChats.length) {
    switchToPrivateMode(ctx)
    toUserMode(ctx)
    if (ctx.dbuser.id) {
      await ctx.telegram.sendMessage(
        ctx.dbuser.id,
        i18n.t('ru', 'adminMode_off'),
        {
          reply_markup: { remove_keyboard: true },
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }
      )
    }
    return
  }

  ctx.adminChats = userChats
  ctx.adminChatActive =
    userChats.find((chat) => chat.id === ctx.dbuser.adminModeChatId) ??
    ctx.adminChats[0] ??
    null
}

export const switchToPrivateMode = async (ctx: Context) => {
  ctx.adminChats = []
  ctx.adminChatActive = null
}
