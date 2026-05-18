import { Context, Middleware } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'

import { switchToAdminMode } from '@/helpers/adminMode'

import { log } from './log'

interface CommandWrapperConfig {
  availableForAdmins: boolean
  availableForUsers?: boolean
  bossOnly?: boolean
}

const { BOSS_TG_ID } = process.env

export function commandWrapper(
  {
    availableForAdmins,
    availableForUsers = true,
    bossOnly = false,
  }: CommandWrapperConfig,
  callback: (ctx: Context) => Promise<void>
): Middleware<TelegrafContext> {
  return async (ctx) => {
    // TODO: Remove single-bot-specific logic from here
    if (!availableForAdmins && ctx.dbuser?.adminMode) {
      try {
        await ctx.replyWithHTML(ctx.i18n.t('adminMode_commandHidden'))
      } catch (e) {
        log.error('Error in wrapper:', e)
      }
      return
    }

    if (bossOnly && ctx.dbuser?.id !== Number(BOSS_TG_ID)) {
      return
    }

    if (!availableForUsers && !ctx.dbuser?.adminMode) {
      return
    }

    if (ctx.dbuser?.adminMode && !ctx.adminChatActive) {
      await switchToAdminMode(ctx)
    }

    try {
      await callback(ctx)
    } catch (e) {
      await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      log.error(e)
    }
  }
}
