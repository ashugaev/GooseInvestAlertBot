import { Telegraf, Context } from "telegraf";
import { getInstrumentDataWithPrice } from "../helpers/getInstrumentData";
import { getLastPrice } from "../helpers/stocksApi";
import { log } from "../helpers/log";
import { symbolOrCurrency } from "../helpers/symbolOrCurrency";
import { getAlias } from "../models";
import { commandWrapper } from "../helpers/commandWrapper";

export function setupPrice(bot: Telegraf<Context>) {
    bot.command(['price'], commandWrapper(async ctx => {
        const data: string[] = ctx.message.text.match(/price ([a-zA-Zа-яА-ЯёЁ0-9]+)$/)

        if (data) {
            const symbol = data[1];
            let instrumentData;
            let price;

            try {
                const data = await getInstrumentDataWithPrice({ symbol, ctx });

                price = data.price;
                instrumentData = data.instrumentData;
            } catch (e) {
                await ctx.replyWithHTML(ctx.i18n.t('priceCheckError', { symbol }))

                log.error(e);

                return;
            }

            const { name } = instrumentData;
            const { currency } = instrumentData.sourceSpecificData;

            ctx.replyWithHTML(ctx.i18n.t('price', {
                price,
                currency: symbolOrCurrency(currency),
                name,
                symbol: symbol.toUpperCase(),
            }))

            return;
        }

        await ctx.replyWithHTML(ctx.i18n.t('priceInvalidFormat'))
    }))
}
