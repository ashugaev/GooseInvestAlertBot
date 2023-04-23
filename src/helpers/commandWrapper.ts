import {Context, Middleware} from 'telegraf'
import {TelegrafContext} from 'telegraf/typings/context'

import {log} from './log'

interface CommandWrapperConfig {
    availableForAdmins: boolean
}

export function commandWrapper({availableForAdmins}: CommandWrapperConfig, callback: (ctx: Context) => Promise<void>): Middleware<TelegrafContext> {
    return async (ctx) => {
        if (!availableForAdmins && ctx.adminMode) {
            try {
                await ctx.replyWithHTML(ctx.i18n.t('adminMode_commandHidden'))
            } catch (e) {
                log.error('Error in wrapper:', e)
            }
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
