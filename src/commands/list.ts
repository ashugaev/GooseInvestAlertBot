import {Telegraf, Context, Extra} from "telegraf";
import {getAlerts, removePriceAlert} from "../models";
import {log} from '../helpers/log'

export function setupList(bot: Telegraf<Context>) {
    bot.command('list', async ctx => {
        let alertsList;

        try {
            alertsList = await getAlerts({user: ctx.from.id})
        } catch (e) {
            log.error(e);
            return;
        }

        if (!alertsList.length) {
            await ctx.replyWithHTML(ctx.i18n.t('alertListEmpty'))
            return;
        }

        for (let i = 0; alertsList.length > i; i++) {
            const alert = alertsList[i];
            const price = alert.lowerThen || alert.greaterThen;

            await ctx.replyWithHTML(
                ctx.i18n.t('alertListItem', {
                    symbol: alert.symbol,
                    price
                }),
                Extra
                    .markdown()
                    .markup((m) => m.inlineKeyboard([
                        m.callbackButton(ctx.i18n.t('alertListDeleteButton'),
                            `delete_${alert._id}`
                        )
                    ]))
            )
        }
    })

    bot.action(/^delete_(.*)$/, async (ctx) => {
        const _id = ctx.match[1];

        try {
            await removePriceAlert({_id})

            await ctx.deleteMessage();
        } catch (e) {
            log.error(e);
            await ctx.reply(ctx.i18n.t('alertListItemDeleteError'))
        }
    })
}
