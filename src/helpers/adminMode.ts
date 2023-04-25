import {Context} from "telegraf"

import {getUserChats} from "@/models/Chat"

export const switchToAdminMode = async (ctx: Context) => {
  const userChats = await getUserChats(ctx.dbuser?.id)

  ctx.adminChats = userChats
  ctx.adminChatActive = userChats.find(chat => chat.id === ctx.dbuser.adminModeChatId)
}

export const switchToPrivateMode = async (ctx: Context) => {
  ctx.adminChats = []
  ctx.adminChatActive = null
}