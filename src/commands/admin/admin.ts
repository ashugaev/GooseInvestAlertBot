import {Context, Telegraf} from "telegraf"

import {switchToPrivateMode} from "@/helpers/adminMode"
import {commandWrapper} from "@/helpers/commandWrapper"
import {getAdminAttachedMenu} from "@/menu/getAdminAttachedMenu"
import { toUserMode, userObjToAdminMode} from "@/models"
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

    await userObjToAdminMode(ctx, userChats[0].id)

    await ctx.replyWithHTML(ctx.i18n.t('adminMode_on'), getAdminAttachedMenu({
      chats: userChats, activeChatId: ctx.dbuser.adminModeChatId
    }))
    await ctx.replyWithHTML(ctx.i18n.t('adminMode_activeChatChanged', {title: ctx.adminChatActive.title}))
  }))

  bot.hears(/Chat\:.+/, commandWrapper({availableForAdmins: true, availableForUsers: false}, async ctx => {
    const chatName = ctx.message.text.replace('Chat: ', '')
    const chatObj = ctx.adminChats.find(chat => chat.title === chatName)
    if (!chatObj) {
      // await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      return
    }
    await userObjToAdminMode(ctx, chatObj.id)
    await ctx.replyWithHTML(ctx.i18n.t('adminMode_activeChatChanged', {title: chatObj.title}), getAdminAttachedMenu({
      chats: ctx.adminChats, activeChatId: ctx.dbuser.adminModeChatId
    }))
  }))

  bot.hears('🏃🏽‍♂️Выйти из режима админа', commandWrapper({
    availableForAdmins: true, availableForUsers: false
  }, async ctx => {
    await toUserMode(ctx)

    await switchToPrivateMode(ctx)
    await ctx.replyWithHTML(ctx.i18n.t('adminMode_off'), {reply_markup: {remove_keyboard: true}})
  }))

  bot.action('admin_exit', commandWrapper({
    availableForAdmins: true, availableForUsers: false
  }, async ctx => {
    await toUserMode(ctx)

    await switchToPrivateMode(ctx)
    await ctx.replyWithHTML(ctx.i18n.t('adminMode_off'), {reply_markup: {remove_keyboard: true}})
  }))
}