import {Telegraf, Context, Extra} from "telegraf";
import {log} from "../helpers/log";

export function setupStart(bot: Telegraf<Context>) {
    bot.command(['start'], ctx => {
        try {
            const {first_name} = ctx.message.from;

            const params = Extra
                .HTML(true)
                .webPreview(false)
                .markup((m) => m.keyboard([
                    // TODO: Доделать кнопки снизу
                    //     m.callbackButton(ctx.i18n.t('alert_button'))
                    //     m.callbackButton(ctx.i18n.t('help_button'))
                ]))

            ctx.replyWithHTML(ctx.i18n.t('start', {
                    first_name
                }),
                params
            )
        } catch (e) {
            ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
            log.error(e);
        }
    })
}
