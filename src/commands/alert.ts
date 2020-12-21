import {Telegraf, Context} from "telegraf";
import {addPriceAlert, AddPriceAlertParams, getAlias, removePriceAlert} from '../models';
import {getLastPrice, GetLastPriceData} from "../helpers/stocksApi";
import {log} from "../helpers/log";
import {Scenes} from "../constants";
import {symbolOrCurrency} from "../helpers/symbolOrCurrency";

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

        let instrumentData: GetLastPriceData = null;

        try {
            instrumentData = await getLastPrice(symbol);
        } catch (e) {
            try {
                symbol = data[2];
                const [alias] = await getAlias({title: symbol, user});

                instrumentData = await getLastPrice(alias.symbol);

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

        let _id = null;

        try {
            const params: AddPriceAlertParams = {
                user,
                symbol,
                name: instrumentData.name,
                currency: instrumentData.currency,
            };

            instrumentData.lastPrice < price
                ? (params.greaterThen = price)
                : (params.lowerThen = price)

            const createdItem = await addPriceAlert(params);

            _id = createdItem._id;
        } catch (e) {
            await ctx.replyWithHTML(ctx.i18n.t('alertErrorPushToDatabase'));
            log.error(e)

            return;
        }

        const {name, currency} = instrumentData;

        const i18nParams = {
            price,
            symbol,
            aliasName,
            currency: symbolOrCurrency(currency),
            name,
        };

        await ctx.replyWithHTML(
            aliasName
                ? ctx.i18n.t('alertCreatedWithAlias', i18nParams)
                : ctx.i18n.t('alertCreated', i18nParams)
        )

        // @ts-ignore
        ctx.scene.enter(Scenes.alert, {_id})
    })
}
