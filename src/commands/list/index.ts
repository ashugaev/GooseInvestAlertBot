import {Telegraf, Context, Extra} from "telegraf";
import {getAlerts} from "../../models";
import {log} from '../../helpers/log'
import {commandWrapper} from "../../helpers/commandWrapper";
import {instrumentsListKeyboard} from "./keyboards/instrumentsListKeyboard";
import {alertsForInstrument} from "./actions/alertsForInstrument";
import {instrumentsListPagination} from "./actions/instrumentsListPagination";
import {showInstrumentPage} from "./utils/showInstrumentPage";

export interface ITickerButtonItem {
    name: string,
    symbol: string,
    currency: string
}

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
        let uniqTickersData;

        // Получение данных и запись их в контекст
        try {
            alertsList = await getAlerts({user: ctx.from.id, symbol: forSymbol});

            if (!alertsList.length) {
                await ctx.replyWithHTML(ctx.i18n.t('alertListEmpty'))
                return;
            }

            // Получаем уникальные тикеры из всех алертов
            uniqTickersData = Object.values(alertsList.reduce((acc, {name, symbol, currency}) => {
                if (acc[symbol]) return acc;

                acc[symbol] = {name, symbol, currency}

                return acc;
            }, {}))
                .sort((a: ITickerButtonItem, b: ITickerButtonItem) => (a.name > b.name ? 1 : -1));

            // Подкидываем состояния в констекст, что бы не делать перезапрос по нажатию на кнопки
            ctx.session.listCommand = {
                alertsList,
                uniqTickersData
            };
        } catch (e) {
            log.error(e);
            return;
        }

        if (forSymbol) {
            showInstrumentPage({page: 0, symbol: forSymbol, ctx, instrumentItems: alertsList, edit: false});
        } else {
            ctx.replyWithHTML(ctx.i18n.t('alertList_titles'),
                Extra
                    .HTML(true)
                    .markup(instrumentsListKeyboard({page: 0, uniqTickersData}))
            )
        }
    }))

    bot.action(/^([A-Z0-9]+)_page_([0-9]+)$/, alertsForInstrument)
    bot.action(/^instrumentsList_page_(\d+)$/, instrumentsListPagination)
}
