// Dependencies
import {Telegraf, Context} from "telegraf";
import {log} from "../helpers/log";

export function setupHelp(bot: Telegraf<Context>) {
    bot.command(['help'], ctx => {
        try {
            ctx.replyWithHTML(ctx.i18n.t('help'),
                {disable_web_page_preview: true}
            )
        } catch (e) {
            ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
            log.error(e);
        }
    })
}
