import {Context} from "telegraf"

import {switchToAdminMode, switchToPrivateMode} from "@/helpers/adminMode"
import {createOrUpdateChat} from "@/models/Chat"
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

/**
 * Проверки удаления бота из чата
 * Проверка изменения прав бота
 */
export async function attachUser(ctx: Context, next) {
  try {
    // Every update will be handled
    // Unhandled updates must send error
    const update = ctx.update
    let from = ctx.from
    let chat = ctx.chat

    // Bot was updated
    // In this update type we possibly don't have from or chat declared
    // @ts-ignore
    if(!chat && ctx.update?.my_chat_member) {
      // @ts-ignore
      if(!chat) {chat = ctx.update.my_chat_member.chat}
      // @ts-ignore
      if (!from) {from = ctx.update.my_chat_member.from}
    }
    
    // chat or private
    if(from?.id) {
      const dbuser = await findUser(from.id, ctx.goose.id)
      ctx.dbuser = dbuser
    }

    if (chat.type === 'private' && ctx.dbuser) {
      if(ctx.dbuser?.adminMode) {
        await switchToAdminMode(ctx)
      } else {
        await switchToPrivateMode(ctx)
      }

      await updateLimits(ctx)

      return next()
    }

    if(!chat) {
      log.error('No chat obj. Unrecognized update',update)
      return 
    }

    // Bot was kicked
    const wasKicked =
        // Bot was kicked from chat
        (
          ctx.updateSubTypes?.includes('left_chat_member') &&
          ctx.update.message?.left_chat_member.id === ctx.goose.id
        ) ||
        // Bot was kicked from channel
        // @ts-ignore
        ctx.update.my_chat_member?.new_chat_member?.status === 'kicked' ||
        // @ts-ignore
        ctx.update.my_chat_member?.new_chat_member?.status === 'left'

    await createOrUpdateChat(chat, ctx, wasKicked)
    
    const isChat = chat.type === 'group' || chat.type === 'supergroup'
    const isChannel = chat.type === 'channel'

    if (isChat) {
      //
    } else if (isChannel) {
      //
    } else {
      log.error(logPrefix, 'Неизвестный тип чата', chat)
      return
    }
  } catch (e) {
    log.error(logPrefix, e)
    return
  }
}
