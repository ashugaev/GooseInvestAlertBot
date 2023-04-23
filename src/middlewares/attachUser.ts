import {Context} from "telegraf"

import {createChat, deactivateChat, updateChatTitle} from "@/models/Chat"

import {log} from '../helpers/log'
import {findUser} from '../models'

// Используется только тут. Экспортить лимиты из ctx.limits
export enum Limits {
    priceLevels = 100,
    shifts = 30,
}

// Обновляет лимиты в контексте
export function updateLimits(ctx: Context) {
    if (ctx.isGroup) {
        ctx.limits = ctx.dbchat.limits
    } else {
        ctx.limits = ctx.dbuser.limits
    }

    if (!ctx.limits) {
        ctx.limits = Limits
    }

    if (!ctx.limits.shifts) {
        ctx.limits.shifts = Limits.shifts
    }

    if (!ctx.limits.priceLevels) {
        ctx.limits.priceLevels = Limits.priceLevels
    }
}

export async function attachUser(ctx: Context, next) {
    const user = ctx.from
    const chat = ctx.chat

    if (chat.type === 'private') {
        const dbuser = await findUser(user.id)
        ctx.dbuser = dbuser
        // ctx.isGroup = false
        ctx.isPrivate = true
        ctx.adminMode = dbuser.adminMode
    } else if (chat.type === 'group' || chat.type === 'supergroup') {
        // Update chat title
        if (ctx.updateSubTypes.includes('new_chat_title')) {
            await updateChatTitle(chat)
        }

        // Bot was added
        if (
            ctx.updateSubTypes.includes('new_chat_members') &&
            ctx.update.message.new_chat_members.some(user => user.id === ctx.goose.id)
        ) {
            const admins = await ctx.telegram.getChatAdministrators(chat.id)
            createChat(chat, admins)
        }

        // Group created
        if (ctx.updateSubTypes.includes('group_chat_created')) {
            const admins = await ctx.telegram.getChatAdministrators(chat.id)
            createChat(chat, admins)
        }

        // Bot was removed
        if (ctx.updateSubTypes.includes('left_chat_member') && ctx.update.message.left_chat_member.id === ctx.goose.id) {
            await deactivateChat(chat)
        }

        return
    } else if (chat.type === 'channel') {
        console.info('Channel message skip', chat)
        // TODO: Add channel to list in db
        return
    } else {
        log.error('Неизвестный тип чата', chat)
        return
    }

    // Не должно срабатывать потому что есть обработка канал сверху, но на всякий случай
    if (!chat.id) {
        log.error('Нет id юзера в ctx.from, грохаю сессию', user, chat)

        return
    }

    updateLimits(ctx)

    next()
}
