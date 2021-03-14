import {Markup} from "telegraf";
import {listConfig} from "../../../config";
import {paginationButtons} from "../../../keyboards/paginationButtons";
import {backButton} from "../../../keyboards/backButton";


/**
 * Клавиши для страницы с алертами одного инструмента
 */
export const instrumentPageKeyboard = (ctx, {page, itemsLength, symbol, withoutBackButton}) => {
    const keys = [];

    // TODO: В пагинации передавать признак withoutBackButton в экшен
    // Получаю кнопки пагинации
    const paginatorButtons = paginationButtons({
        page,
        itemsPerPage: listConfig.itemsPerPage,
        itemsLength,
        name: symbol.toUpperCase()
    })

    keys.push(paginatorButtons);
    withoutBackButton && (keys.push([backButton({action: 'instrumentsList_page_0'})]));

    return Markup.inlineKeyboard(keys)
}

