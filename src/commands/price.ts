import {Telegraf, Context} from "telegraf";
import {getLastPrice} from "../helpers/stocksApi";
import {log} from "../helpers/log";
import {symbolOrCurrency} from "../helpers/symbolOrCurrency";
import {getAlias} from "../models";
import {commandWrapper} from "../helpers/commandWrapper";

export function setupPrice(bot: Telegraf<Context>) {
    bot.command(['price'], commandWrapper(async ctx => {
        const data: string[] = ctx.message.text.match(/price ([a-zA-Zа-яА-ЯёЁ0-9]+)$/)

        if (data) {
            let symbol = data[1];
            let symbolData = null;

            try {
                symbolData = await getLastPrice(symbol);
            } catch (e) {
                try {
                    const {id: user} = ctx.from;
                    const [alias] = await getAlias({title: symbol, user});

                    symbol = alias.symbol;

                    symbolData = await getLastPrice(alias.symbol);
                } catch (e) {
                    await ctx.replyWithHTML(ctx.i18n.t('priceCheckError', {symbol}))
                    log.error(e);
                    return;
                }
            }

            const {lastPrice, name, currency} = symbolData;

            ctx.replyWithHTML(ctx.i18n.t('price', {
                price: lastPrice,
                currency: symbolOrCurrency(currency),
                name,
                symbol: symbol.toUpperCase(),
            }))

            return;
        }

        await ctx.replyWithHTML(ctx.i18n.t('priceInvalidFormat'))
    }))
}
