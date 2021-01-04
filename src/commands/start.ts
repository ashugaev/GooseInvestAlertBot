import {Telegraf, Context} from "telegraf";
import {log} from "../helpers/log";

export function setupStart(bot: Telegraf<Context>) {
    bot.command(['start'], ctx => {
        try {
            const {first_name} = ctx.message.from;

            ctx.replyWithHTML(ctx.i18n.t('start', {
                    first_name
                }),
                {disable_web_page_preview: true}
            )
        } catch (e) {
            ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
            log.error(e);
        }
    })
}
