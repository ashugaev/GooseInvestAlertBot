import {listConfig} from "../../../config";
import {symbolOrCurrency} from "../../../helpers/symbolOrCurrency";
import {getLastPrice} from "../../../helpers/stocksApi";
import {log} from "../../../helpers/log";
import {getInstrumentLink} from "../../../helpers/getInstrumentLInk";
import {instrumentPageKeyboard} from "../keyboards/instrumentPageKeyboard";

export const showInstrumentPage = async ({page, ctx, instrumentItems, symbol, edit}) => {
    const itemsToShow = instrumentItems
        .slice(page * listConfig.itemsPerPage, (page + 1) * listConfig.itemsPerPage)

    const itemsList = itemsToShow.map(({symbol, message, lowerThen, greaterThen, currency, name}, i) => {
        const price = lowerThen || greaterThen;

        const action = greaterThen ? 'Рост' : 'Падение';

        return ctx.i18n.t('alertList_item', {
            number: i + 1,
            price,
            message,
            currency: symbolOrCurrency(currency),
            action,
        })
    }).join('\n');

    const {type: instrumentType, name: instrumentName, currency: instrumentCurrency} = instrumentItems[0];

    let instrumentPrice;

    try {
        // TODO: Брать данные о цене из кэша. Сейчас перезапрос идет на каждой странице с алертами.
        const data = await getLastPrice(symbol);
        instrumentPrice = data.lastPrice
    } catch (e) {
        log.error('ошибка получения цены', e);
    }

    let message = ctx.i18n.t('alertList_page', {
        link:  instrumentType && getInstrumentLink(instrumentType, symbol),
        symbol,
        list: itemsList,
        name: instrumentName,
        currency: symbolOrCurrency(instrumentCurrency),
        price: instrumentPrice,
    })

    ctx[edit ? 'editMessageText' : 'replyWithHTML'](message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
            ...instrumentPageKeyboard(ctx, {page, itemsLength: instrumentItems.length, symbol, withoutBackButton: false})
        }
    })
}