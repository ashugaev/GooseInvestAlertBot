import {Telegraf, Context} from "telegraf";

export function setupStart(bot: Telegraf<Context>) {
    bot.command(['start'], ctx => {
        const {first_name} = ctx.message.from;

        ctx.replyWithHTML(ctx.i18n.t('start', {
                first_name
            }),
            {disable_web_page_preview: true}
        )
    })
}
