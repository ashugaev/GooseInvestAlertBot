import {Telegraf, Context, Extra} from "telegraf";
import {addPriceAlert, AddPriceAlertParams, removePriceAlert} from '../models';
import {getLastPrice} from "../helpers/stocksApi";
import {log} from "../helpers/log";

export function setupAlert(bot: Telegraf<Context>) {
    bot.command(['alert'], async ctx => {
        const {text} = ctx.message;

        let data = text.match(/^\/alert remove (\w+)$/)

        // Is command to remove
        if (data) {
            const symbol = data[1].toUpperCase();

            try {
                await removePriceAlert({symbol})
                await ctx.replyWithHTML(ctx.i18n.t('alertRemovedBySymbol', {symbol}))
            } catch (e) {
                await ctx.replyWithHTML(ctx.i18n.t('alertRemoveError'))
                log.error(e);
            }

            return;
        }

        data = text.match(/^\/alert\s(\w+)\s([\d\.]+)$/);

        // Invalid Format
        if (data === null) {
            await ctx.replyWithHTML(ctx.i18n.t('alertErrorInvalidFormat'))
            return;
        }

        const symbol = data[1].toUpperCase();
        const price = parseFloat(data[2]);
        const {id} = ctx.from;

        let currentPrice;

        try {
            currentPrice = await getLastPrice(symbol);
        } catch (e) {
            await ctx.replyWithHTML(
                ctx.i18n.t('alertErrorUnexistedSymbol', {symbol}),
                {disable_web_page_preview: true}
            )

            console.error(e);

            return;
        }

        try {
            const params: AddPriceAlertParams = {user: id, symbol};

            currentPrice < price
                ? (params.greaterThen = price)
                : (params.lowerThen = price)

            await addPriceAlert(params);
        } catch (e) {
            await ctx.replyWithHTML(ctx.i18n.t('alertErrorPushToDatabase'));
            console.error(e)

            return;
        }

        await ctx.replyWithHTML(ctx.i18n.t('alertCreated', {price, symbol}))
    })
}
