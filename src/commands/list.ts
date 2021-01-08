import {Telegraf, Context, Extra} from "telegraf";
import {getAlerts, removePriceAlert} from "../models";
import {log} from '../helpers/log'
import {symbolOrCurrency} from "../helpers/symbolOrCurrency";
import {commandWrapper} from "../helpers/commandWrapper";

export function setupList(bot: Telegraf<Context>) {
    bot.command('list', commandWrapper(async ctx => {
        const data = ctx.message.text.match(/list\s?(\w+)?$/)

        // Invalid Format
        if (data === null) {
            await ctx.replyWithHTML(ctx.i18n.t('alertListErrorInvalidFormat'))
            return;
        }

        const forSymbol = data[1]
        let alertsList;

        try {
            alertsList = await getAlerts({user: ctx.from.id, symbol: forSymbol})
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
            const {symbol, message, lowerThen, greaterThen, currency, name} = alert;
            const price = lowerThen || greaterThen;

            const i18nParams = {
                symbol,
                price,
                name,
                message,
                currency: symbolOrCurrency(currency),
            };

            await ctx.replyWithHTML(
                message && message.length
                    ? ctx.i18n.t('alertListItemWithMessage', i18nParams)
                    : ctx.i18n.t('alertListItem', i18nParams),
                Extra
                    .HTML(true)
                    .markup((m) => m.inlineKeyboard([
                        m.callbackButton(ctx.i18n.t('alertListDeleteButton'),
                            `delete_alert_${alert._id}`
                        )
                    ]))
            )
        }
    }))

    bot.action(/^delete_alert_(.*)$/, async (ctx) => {
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
