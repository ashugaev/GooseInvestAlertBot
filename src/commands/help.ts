// Dependencies
import {Telegraf, Context} from "telegraf";
import {commandWrapper} from "../helpers/commandWrapper";

export function setupHelp(bot: Telegraf<Context>) {
    bot.command(['help'], commandWrapper(ctx => {
        ctx.replyWithHTML(ctx.i18n.t('help'),
            {disable_web_page_preview: true}
        )
    }))
}
