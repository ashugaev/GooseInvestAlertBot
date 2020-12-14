import {Telegraf, Context, Extra} from "telegraf";
import {addPriceAlert, AddPriceAlertParams} from '../models';
import {getLastPrice} from "../helpers/stocksApi";

export function setupAlert(bot: Telegraf<Context>) {
    bot.command(['alert'], async ctx => {
        const {text} = ctx.message;

        const data = text.match(/^\/alert\s(\w+)\s([\d\.]+)$/);

        // Invalid Format
        if (data === null) {
            ctx.replyWithHTML(ctx.i18n.t('alertErrorInvalidFormat'))
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
