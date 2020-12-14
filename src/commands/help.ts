// Dependencies
import {Telegraf, Context} from "telegraf";

export function setupHelp(bot: Telegraf<Context>) {
    bot.command(['help'], ctx => {
        ctx.replyWithHTML(ctx.i18n.t('help'),
            {disable_web_page_preview: true}
        )
    })
}
