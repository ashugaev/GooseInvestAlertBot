import {listConfig} from "../../../config";
import {Markup} from "telegraf";
import {paginationButtons} from "../../../keyboards/paginationButtons";

/**
 * Вернет список кнопок для каждого инструмента по массиву данных
 */
export const instrumentsListKeyboard = ({alertsList, page}) => {
    // Получаем уникальные тикеры из всех алертов
    const uniqTickersData = Object.values(alertsList.reduce((acc, {name, symbol, currency}) => {
        if (acc[symbol]) return acc;

        acc[symbol] = {name, symbol, currency}

        return acc;
    }, {}));

    // Тикеры которые выведем на это странице
    const pageTickers = uniqTickersData.slice(page * listConfig.itemsPerPage, (page + 1) * listConfig.itemsPerPage)

    // Генерит инлайн кнопки по тикерам
    const getTickerButtons = pageTickers.map(({name, symbol}) => ([
        Markup.callbackButton(
            `${name} (${symbol})`,
            `${symbol.toUpperCase()}_page_0`,
        )
    ]));

    // Получаю кнопки пагинации
    const paginatorButtons = paginationButtons({
        page,
        itemsPerPage: listConfig.itemsPerPage,
        itemsLength: uniqTickersData.length,
        name: 'instrumentsList'
    })

    getTickerButtons.push(paginatorButtons);

    return Markup.inlineKeyboard(getTickerButtons)
}
