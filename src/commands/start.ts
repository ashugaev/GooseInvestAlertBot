// Dependencies
import {Telegraf, Context, Extra} from "telegraf";

export function setupStart(bot: Telegraf<Context>) {
    bot.command(['start'], ctx => {
        ctx.replyWithHTML(ctx.i18n.t('start'),
            {disable_web_page_preview: true}
        )
    })
}
