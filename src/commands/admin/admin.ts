import {Context, Telegraf} from "telegraf"

import {commandWrapper} from "@/helpers/commandWrapper"
import {getAdminAttachedMenu} from "@/menu/getAdminAttachedMenu"
import {toAdminMode, toUserMode} from "@/models"
import {getUserChats} from "@/models/Chat"

export function setupAdmin(bot: Telegraf<Context>) {
  bot.command(['admin'], commandWrapper({availableForAdmins: true}, async (ctx) => {
    const userChats = await getUserChats(ctx.from.id)

    if (!userChats.length) {
      await ctx.replyWithHTML(ctx.i18n.t('adminMode_noChats'))
      await toUserMode(ctx)
      return
    }

    ctx.adminChats = userChats
    ctx.adminChatActive = userChats.find(chat => chat.id === ctx.dbuser.adminModeChatId)

    await toAdminMode(ctx, userChats[0].id)

    await ctx.replyWithHTML(ctx.i18n.t('adminMode_on'), getAdminAttachedMenu({
      chats: userChats, activeChatId: ctx.dbuser.adminModeChatId
    }))
  }))

  bot.hears(/Switch to\:.+/, commandWrapper({availableForAdmins: true, availableForUsers: false}, async ctx => {
    const chatName = ctx.message.text.replace('Switch to: ', '')
    const chatObj = ctx.adminChats.find(chat => chat.title === chatName)
    if (!chatObj) {
      await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      return
    }
    await toAdminMode(ctx, chatObj.id)
    await ctx.replyWithHTML(ctx.i18n.t('adminMode_activeChatChanged', {title: chatObj.title}), getAdminAttachedMenu({
      chats: ctx.adminChats, activeChatId: ctx.dbuser.adminModeChatId
    }))

    bot.hears('🏃🏽‍♂️Выйти из режима админа', commandWrapper({
      availableForAdmins: true, availableForUsers: false
    }, async ctx => {
      await toUserMode(ctx)
      ctx.adminChats = null
      ctx.adminChatActive = null

      await ctx.replyWithHTML(ctx.i18n.t('adminMode_off'), {reply_markup: {remove_keyboard: true}})
    }))
  }))
}