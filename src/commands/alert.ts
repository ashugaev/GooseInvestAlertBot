import {Telegraf, Context} from "telegraf";
import {getAlertsCountForUser, getAlias, removePriceAlert} from '../models';
import {log} from "../helpers/log";
import {Limits, Scenes} from "../constants";
import {addAlert} from "../helpers/addAlert";
import {i18n} from "../helpers/i18n";
import {commandWrapper} from "../helpers/commandWrapper";

export function setupAlert(bot: Telegraf<Context>) {
    const callback = commandWrapper(async ctx => {
        const {text} = ctx.message;
        const {id: user} = ctx.from;

        const customUserAlertsLimit = ctx.dbuser.limits?.alerts;
        const alertsLimit = customUserAlertsLimit ?? Limits.alerts

        // Сценарий добавления
        let data: string[] = text.match(/^\/(alert|add)$/)

        if (data) {
            try {
                if (await getAlertsCountForUser(user) >= alertsLimit) {
                    // TODO: Плюрализация для количества алертов
                    ctx.replyWithHTML(ctx.i18n.t('alerts_overlimit', {limit: alertsLimit}))
                    return;
                }
            } catch (e) {
                log.error(e);
            }

            ctx.scene.enter(Scenes.alertAdd);

            return;
        }

        // Удаление алертов по инструменту
        data = text.match(/^\/alert remove ([a-zA-Zа-яА-ЯёЁ0-9]+)$/)

        if (data) {
            const symbol = data[1];

            try {
                await removePriceAlertAndSendMessage({symbol, user, ctx})
            } catch (e) {
                log.error(e);
            }

            return;
        }

        data = text.match(/^\/(alert|add) ([a-zA-Zа-яА-ЯёЁ0-9]+) ([\d\.\s\-\+%]+)$/);

        // Command to add alert
        if (data) {
            try {
                if (await getAlertsCountForUser(user) >= alertsLimit) {
                    ctx.replyWithHTML(ctx.i18n.t('alerts_overlimit', {limit: alertsLimit}))
                    return;
                }

                await addAlert({
                    data: {symbol: data[2], price: data[3]},
                    ctx
                });
            } catch (e) {
                log.error(e);
            }

            return;
        }

        // Invalid Format
        ctx.replyWithHTML(ctx.i18n.t('alertErrorInvalidFormat'))
    })

    bot.command(['alert', 'add'], callback);
    bot.hears(i18n.t('ru', 'alert_button'), callback)

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

                log.info('Удалены алерты для', symbol, user)

                rs();
            } catch (e) {
                await ctx.replyWithHTML(ctx.i18n.t('alertRemoveError'))
                rj(e);
            }
        })
    }
}
