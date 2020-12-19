import {Telegraf, Context, Extra} from "telegraf";
import {addPriceAlert, AddPriceAlertParams, getAlias, removePriceAlert} from '../models';
import {getLastPrice} from "../helpers/stocksApi";
import {log} from "../helpers/log";

export function setupAlert(bot: Telegraf<Context>) {
    bot.command(['alert', 'add'], async ctx => {
        const {text} = ctx.message;
        const {id: user} = ctx.from;

        let data = text.match(/^\/(alert|add) remove ([a-zA-Zа-яА-ЯёЁ0-9]+)$/)

        // Is command to remove
        if (data) {
            let symbol = data[2].toUpperCase();

            try {
                const deletedCount = await removePriceAlert({symbol, user})

                if (deletedCount) {
                    await ctx.replyWithHTML(ctx.i18n.t('alertRemovedBySymbol', {symbol}))
                } else {
                    symbol = data[2];

                    const [alias] = await getAlias({title: symbol, user});

                    const aliasName = alias.title;
                    symbol = alias.symbol;

                    await removePriceAlert({symbol, user})
                    await ctx.replyWithHTML(ctx.i18n.t('alertRemovedBySymbolWithAlias', {symbol, aliasName}))
                }

                console.info('Удалены алерты для', symbol, user)
            } catch (e) {
                await ctx.replyWithHTML(ctx.i18n.t('alertRemoveError'))
                log.error(e);
            }

            return;
        }

        data = text.match(/^\/(alert|add) ([a-zA-Zа-яА-ЯёЁ0-9]+) ([\d\.]+)$/);

        // Invalid Format
        if (data === null) {
            await ctx.replyWithHTML(ctx.i18n.t('alertErrorInvalidFormat'))
            return;
        }

        let symbol = data[2].toUpperCase();
        let aliasName = null;
        const price = parseFloat(data[3]);

        let currentPrice;

        try {
            currentPrice = await getLastPrice(symbol);
        } catch (e) {
            try {
                symbol = data[2];
                const [alias] = await getAlias({title: symbol, user});

                currentPrice = await getLastPrice(alias.symbol);

                aliasName = symbol;
                symbol = alias.symbol;
            } catch (e) {
                await ctx.replyWithHTML(
                    ctx.i18n.t('alertErrorUnexistedSymbol', {symbol}),
                    {disable_web_page_preview: true}
                )

                log.error(e);

                return;
            }
        }

        try {
            const params: AddPriceAlertParams = {user, symbol};

            currentPrice < price
                ? (params.greaterThen = price)
                : (params.lowerThen = price)

            await addPriceAlert(params);
        } catch (e) {
            await ctx.replyWithHTML(ctx.i18n.t('alertErrorPushToDatabase'));
            log.error(e)

            return;
        }

        await ctx.replyWithHTML(
            aliasName
                ? ctx.i18n.t('alertCreatedWithAlias', {
                    price,
                    symbol,
                    aliasName
                })
                : ctx.i18n.t('alertCreated', {
                    price,
                    symbol,
                }))
    })
}
