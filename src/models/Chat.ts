import {getModelForClass, prop} from '@typegoose/typegoose'
import {Promise} from "mongoose"
import {Context} from "telegraf"
import * as tt from "telegraf/typings/telegram-types"
import {ChatType} from "telegraf/typings/telegram-types"

import {log} from "@/helpers"
import {switchToAdminMode} from "@/helpers/adminMode"
import {getBot} from "@/helpers/bot"
import {i18n} from "@/helpers/i18n"
import {getAdminAttachedMenu} from "@/menu/getAdminAttachedMenu"

export class Chat {
    @prop({required: true, index: true, unique: true})
      id: number | string
    
    @prop({required: true})
      type: ChatType

    @prop({required: true})
      title: string

    @prop({required: true})
      isActive: boolean

    @prop({items: Number, required: true})
      admins: number[]
  
    @prop({required: true})
      haveRights: boolean
}

export const ChatModel = getModelForClass(Chat, {
  schemaOptions: {timestamps: true},
})

const lastUpdatedByChatId = {}
const removeMessageSentByChatId = {}
const updateChatTimeout = 300000
const isTimeForChatUpdate = (chat) => 
  !lastUpdatedByChatId[chat.id] || (Date.now() - lastUpdatedByChatId[chat.id] >= updateChatTimeout)

const getAdmins = async ({wasKicked, ctx, id}): Promise<number[]> => {
  const bot = await getBot(ctx.goose.id)
  if(!bot) {
    log.error('Bot removed error. Handle this case gracefully!')
    return []
  }
  const admins = !wasKicked ?  await bot.telegram.getChatAdministrators(id) : []
  return admins.filter((admin) => !admin.user.is_bot).map((admin) => admin.user.id)
}

/**
 * All chat create/update login with debounce
 */
export async function createOrUpdateChat(chat: tt.Chat, ctx: Context, wasKicked = false) {
  const {id, title, type} = chat
  
  if(!id) {
    throw new Error('No chat id')
    return
  }

  if(!isTimeForChatUpdate(chat)) {
    return
  }

  let nonBotAdmins: number[] = []

  if(ctx.dbuser) {
    // Правит баг с тем, что иногда бот не видит список админов
    nonBotAdmins.push(ctx.dbuser.id)
  }

  // When this event about adding bot to channel it will be creshed
  try {
    const admins = await getAdmins({
      wasKicked,
      ctx,
      id
    })

    nonBotAdmins = [...nonBotAdmins, ...admins]
  } catch (e) {
    // This case is possible when
    // bot was added to channel (not every time)
    // bot was kicked
    log.error('Error while getting chat admins', e)
  }

  const data: Chat = {
    id,
    title,
    // @ts-ignore
    type,
    isActive: !wasKicked,
    admins: nonBotAdmins,
    haveRights: true
  }

  const oldValue = await ChatModel.findOneAndUpdate({id}, {$set: data}, {upsert: true})

  const isNewChatAdded = !oldValue
  const isChatDeactivated = oldValue && oldValue.isActive && !data.isActive
  const isChatActivated = oldValue && !oldValue.isActive && data.isActive

  // Send hello message to chat
  if((isNewChatAdded || isChatActivated) && id && type && (type === 'group' || type === 'supergroup') && !wasKicked) {
    ctx?.telegram.sendMessage(id, i18n.t('ru', 'admin_helloChat'), {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  }
  // Send new chat message to user
  // Will work only on user update, not channel post
  if((isNewChatAdded || isChatActivated) && ctx.dbuser?.id && !wasKicked) {
    let extraMessageParams = {}

    // Update menu if user in admin mode
    if(ctx.dbuser.adminMode) {
      await switchToAdminMode(ctx)

      extraMessageParams = getAdminAttachedMenu({
        chats: ctx.adminChats,
        activeChatId: ctx.adminChatActive.id
      })
    }

    ctx?.telegram.sendMessage(ctx.dbuser?.id, i18n.t('ru','admin_newChat', {
      title, channel: type === 'channel'
    }),
    {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extraMessageParams
    })
  }

  // Just update menu if user in admin mode
  if(wasKicked && isChatDeactivated && ctx.dbuser.adminMode && !isNewChatAdded) {
    if(removeMessageSentByChatId[id]) {
      return
    }

    removeMessageSentByChatId[id] = true

    await switchToAdminMode(ctx)

    if(!ctx.adminChatActive) {
      return
    }

    const extraMessageParams = getAdminAttachedMenu({
      chats: ctx.adminChats,
      activeChatId: ctx.adminChatActive.id
    })

    await ctx?.telegram.sendMessage(ctx.dbuser?.id, i18n.t('ru','admin_removedChat', {
      title, channel: type === 'channel'
    }),
    {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extraMessageParams
    })
  }
  
  // If no admin we need update as soon as possible
  if(nonBotAdmins.length > 1) {
    lastUpdatedByChatId[id] = Date.now()
  }
}

export const deactivateChat = async (chat: tt.Chat) => {
  await ChatModel.updateOne({id: chat.id}, {isActive: false})
}

export const updateChatTitle = async (chat: tt.Chat) => {
  await ChatModel.updateOne({id: chat.id}, {title: chat.title})
}

export const getUserChats = async (userId: number | string): Promise<Chat[]> => {
  // @ts-ignore
  return await ChatModel.find({
    isActive: true,
    admins: {
      $in: [userId]
    }
  }).lean()
}