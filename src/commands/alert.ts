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

        let data = text.match(/^\/alert remove ([a-zA-Zа-яА-ЯёЁ0-9]+)$/)

        // Is command to remove
        if (data) {
            let symbol = data[1];

            try {
                await removePriceAlertAndSendMessage({symbol, user, ctx})
            } catch (e) {
                log.error(e);
            }

            return;
        }

        data = text.match(/^\/(alert|add) ([a-zA-Zа-яА-ЯёЁ0-9]+) ([\d\.\s\-\+]+)$/);

        // Command to add alert
        if (data) {
            let symbol: string = data[2];
            let instrumentData: GetLastPriceData = null;

            try {
                const result = await getInstrumentDataBySymbolOrAlias({symbol, user, ctx});

                instrumentData = result.instrumentData;
                symbol = result.symbol;
            } catch (e) {
                log.error(e);

                return;
            }

            const prices = getPricesFromString({
                string: data[3],
                lastPrice: instrumentData.lastPrice,
                ctx,
                currency: instrumentData.currency
            });

            const priceAlerts = [];
            let _id = null;

            for (let i = 0, l = prices.length; l > i; i++) {
                const price = prices[i];

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

                    // Для добавления коммента
                    _id = createdItem._id;

                    priceAlerts.push(price);
                } catch (e) {
                    await ctx.replyWithHTML(ctx.i18n.t('alertAddError'));
                    log.error(e)

                    continue;
                }
            }

            if (!priceAlerts.length) return;

            const {name, currency} = instrumentData;

            const i18nParams = {
                price: priceAlerts.map(el => `${el}${symbolOrCurrency(currency)}`).join(', '),
                symbol,
                name,
            };

            await ctx.replyWithHTML(
                priceAlerts.length === 1
                    ? ctx.i18n.t('alertCreated', i18nParams)
                    : ctx.i18n.t('alertCreatedMany', i18nParams)
            )

            // Если только одна цена
            if (prices.length === 1) {
                // @ts-ignore
                ctx.scene.enter(Scenes.alert, {_id})
            }

            return;
        }

        // Invalid Format
        ctx.replyWithHTML(ctx.i18n.t('alertErrorInvalidFormat'))
    })

    function removePriceAlertAndSendMessage({user, symbol, ctx}) {
        return new Promise(async (rs, rj) => {
            try {
                const deletedCount = await removePriceAlert({symbol, user})

                if (deletedCount) {
                    await ctx.replyWithHTML(ctx.i18n.t('alertRemovedBySymbol', {symbol: symbol.toUpperCase()}))
                } else {
                    // Если ничего не удалили по символу идем в алиасы

                    const [alias] = await getAlias({title: symbol, user});

                    const aliasName = alias.title;
                    symbol = alias.symbol;

                    await removePriceAlert({symbol, user})
                    await ctx.replyWithHTML(ctx.i18n.t('alertRemovedBySymbolWithAlias', {symbol, aliasName}))
                }

                console.info('Удалены алерты для', symbol, user)

                rs();
            } catch (e) {
                await ctx.replyWithHTML(ctx.i18n.t('alertRemoveError'))
                rj(e);
            }
        })
    }

    interface GetInstrumentDataBySymbolOrAliasData {
        symbol: string,
        aliasName: string,
        instrumentData: GetLastPriceData,
    }

    function getInstrumentDataBySymbolOrAlias({symbol, user, ctx}) {
        return new Promise<GetInstrumentDataBySymbolOrAliasData>(async (rs, rj) => {
            let instrumentData = null;
            let aliasName = null;

            try {
                instrumentData = await getLastPrice(symbol);
            } catch (e) {
                try {
                    const [alias] = await getAlias({title: symbol, user});

                    instrumentData = await getLastPrice(alias.symbol);

                    aliasName = symbol;
                    symbol = alias.symbol;
                } catch (e) {
                    await ctx.replyWithHTML(
                        ctx.i18n.t('alertErrorUnexistedSymbol', {symbol}),
                        {disable_web_page_preview: true}
                    )

                    rj(e);

                    return;
                }
            }

            rs({instrumentData, symbol, aliasName});
        })
    }

    interface GetPriceFromStringParams {
        string: string,
        lastPrice: number,
        ctx: Context,
        currency: string,
    }

    function getPricesFromString({string, lastPrice, ctx, currency}: GetPriceFromStringParams): number[] {
        const relativeValueMinusRegExp = new RegExp(/^.*\-([\d\.]+).*$/);
        const relativeValuePlusRegExp = new RegExp(/^.*\+([\d\.]+).*$/);

        const prices = string.split(' ').reduce((acc, el) => {
            let val;

            const plusMatch = el.match(relativeValuePlusRegExp);
            const minusMatch = el.match(relativeValueMinusRegExp);

            // normalize elem if it with + -
            if (plusMatch) {
                val = lastPrice + parseFloat(plusMatch[1])
            } else if (minusMatch) {
                val = lastPrice - parseFloat(minusMatch[1]);

                if (val < 0) {
                    log.error('Слишком маленькое значение цены');

                    ctx.replyWithHTML(ctx.i18n.t('alertAddErrorLowerThenZero'));

                    val = null
                }
            } else {
                val = parseFloat(el);
            }

            val && acc.push(+val.toFixed(4))

            return acc
        }, []);

        return prices;
    }
}
