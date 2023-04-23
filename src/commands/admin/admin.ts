import {Context, Telegraf} from "telegraf"

import {commandWrapper} from "@/helpers/commandWrapper"
import {toAdminMode, toUserMode} from "@/models"
import { getUserChats} from "@/models/Chat"

export function setupAdmin (bot: Telegraf<Context>) {
    bot.command(['admin'],  commandWrapper({availableForAdmins: false}, async (ctx) => {
        const userChats = await getUserChats(ctx.from.id)

        if(!userChats.length) {
            await ctx.replyWithHTML(ctx.i18n.t('adminMode_noChats'))
            await toUserMode(ctx)
            return
        }

        await toAdminMode(ctx)

        await ctx.replyWithHTML(ctx.i18n.t('adminMode_on'))
    }))
}