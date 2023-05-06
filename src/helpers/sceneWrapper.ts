import { Middleware } from 'telegraf'

import {findUser} from "@/models"
import {getUserChats} from "@/models/Chat"

import { addAnalyticsToReply, chb_m } from './analytics'
import { i18n } from './i18n'
import { log } from './log'

export function sceneWrapper (intent: string, callback: (ctx: any) => Promise<void>, leaveOnFail?: boolean): Middleware<any> {
  return async (ctx) => {
    try {
      if(!ctx.dbuser) {
        const dbuser = await findUser(ctx.from.id, ctx.goose.id)
        ctx.dbuser = dbuser
        if (dbuser.adminMode) {
          ctx.adminChats = await getUserChats(ctx.from.id)
          ctx.adminChatActive = ctx.adminChats.find(chat => chat.id === ctx.dbuser.adminModeChatId) ?? ctx.adminChats[0]
          ctx.limits = ctx.adminChatActive.limits
        }
      }
      
      addAnalyticsToReply(ctx)
      chb_m({ ctx, intent })

      await callback(ctx)
    } catch (e) {
      log.error('Scene fail:', intent, e)
      await ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))

      if (leaveOnFail) {
        return ctx.scene.leave()
      } else {
        return ctx.wizard.selectStep(ctx.wizard.cursor)
      }
    }
  }
}
