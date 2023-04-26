import {Context} from "telegraf"

import {switchToAdminMode, switchToPrivateMode} from "@/helpers/adminMode"
import {createOrUpdateChat, deactivateChat} from "@/models/Chat"
import {Limits} from "@/types/limits"

import {log} from '../helpers/log'
import {findUser} from '../models'

const logPrefix = '[attachUser]'

// Обновляет лимиты в контексте
export async function updateLimits(ctx: Context) {
  ctx.limits = ctx.dbuser.limits

  if (!ctx.limits) {
    ctx.limits = Limits
  }

  if (!ctx.limits.shifts) {
    ctx.limits.shifts = Limits.shifts
  }

  if (!ctx.limits.priceLevels) {
    ctx.limits.priceLevels = Limits.priceLevels
  }

  return
}

const lastUpdatedByChatId = {}
const updateChatTimeout = 300000

const isTimeForUpdate = (chat) => !lastUpdatedByChatId[chat.id] || (Date.now() - lastUpdatedByChatId[chat.id] >= updateChatTimeout)

/**
 * - Какие права нужны боту для постинга
 * - Как сделать ретрай индекса
 * - Отслеживать продивижение юзера до админа
 */
export async function attachUser(ctx: Context, next) {
  const user = ctx.from
  let chat = ctx.chat
  const update = ctx.update

  // Whet user added bot to group
  // @ts-ignore
  if(!chat && ctx.update?.my_chat_member?.chat?.id) {
    // @ts-ignore
    chat = ctx.update.my_chat_member.chat
  }

  try {
  // chat or private
    if(user?.id) {
      const dbuser = await findUser(user.id)
      ctx.dbuser = dbuser
    }
    
    // Changed admin rights
    // @ts-ignore
    if(update?.my_chat_member?.chat?.id) {
    // @ts-ignore
      const chat = update.my_chat_member.chat
     
      const admins = await ctx.telegram.getChatAdministrators(chat.id)
     
      await createOrUpdateChat(chat, admins)
    }

    if (chat.type === 'private') {
      if(ctx.dbuser?.adminMode) {
        await switchToAdminMode(ctx)
      } else {
        await switchToPrivateMode(ctx)
      }
    } else if (chat.type === 'group' || chat.type === 'supergroup') {
      if (
      // Update chat title
        ctx.updateSubTypes.includes('new_chat_title') ||
          // Group created
          ctx.updateSubTypes.includes('group_chat_created')  ||
          // Bot was added
          (
            ctx.updateSubTypes.includes('new_chat_members') &&
              ctx.update.message.new_chat_members.some(user => user.id === ctx.goose.id)
          )
      ) {
        const admins = await ctx.telegram.getChatAdministrators(chat.id)
        await createOrUpdateChat(chat, admins)
        lastUpdatedByChatId[chat.id] = Date.now()
      } else if (
      // Bot was removed
        ctx.updateSubTypes.includes('left_chat_member') && ctx.update.message.left_chat_member.id === ctx.goose.id
      ) {
        await deactivateChat(chat)
      } else {
        // any other update
        // every 5 min
        if(isTimeForUpdate(chat)) {
          const admins = await ctx.telegram.getChatAdministrators(chat.id)
          await createOrUpdateChat(chat, admins)
          lastUpdatedByChatId[chat.id] = Date.now()
        }
      }

      return
    } else if (chat.type === 'channel') {
      // any update
      // every 5 min
      if(isTimeForUpdate(chat)) {
        const admins = await ctx.telegram.getChatAdministrators(chat.id)
        await createOrUpdateChat(chat, admins)
        lastUpdatedByChatId[chat.id] = Date.now()
      }

      return
    } else {
      log.error(logPrefix, 'Неизвестный тип чата', chat)
      return
    }

    await updateLimits(ctx)

    next()
  } catch (e) {
    log.error(logPrefix, e)
    return
  }
}
