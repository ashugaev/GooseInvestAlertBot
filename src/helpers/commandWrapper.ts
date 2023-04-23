import {Context, Middleware} from 'telegraf'
import {TelegrafContext} from 'telegraf/typings/context'

import {log} from './log'

interface CommandWrapperConfig {
    availableForAdmins: boolean
    availableForUsers?: boolean
}

export function commandWrapper({availableForAdmins, availableForUsers = true}: CommandWrapperConfig, callback: (ctx: Context) => Promise<void>): Middleware<TelegrafContext> {
  return async (ctx) => {
    if (!availableForAdmins && ctx.dbuser.adminMode) {
      try {
        await ctx.replyWithHTML(ctx.i18n.t('adminMode_commandHidden'))
      } catch (e) {
        log.error('Error in wrapper:', e)
      }
      return
    }

    if(!availableForUsers && !ctx.dbuser.adminMode) {
      return
    }

    try {
      await callback(ctx)
    } catch (e) {
      await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
      log.error(e)
    }
  }
}
