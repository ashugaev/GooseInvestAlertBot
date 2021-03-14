import {Extra} from "telegraf";
import {instrumentsListKeyboard} from "../keyboards/instrumentsListKeyboard";

/**
 * Экшен перехода на страницу списка инструментов
 * @param ctx
 */
export const instrumentsListPagination = async (ctx) => {
    const page = Number(ctx.match[1]);

    const alertsList = ctx.session?.listCommand?.alertsList;

    if(!alertsList?.length) {
        ctx.editMessageText(ctx.i18n.t('unrecognizedError'))

        return;
    }

    ctx.editMessageText(ctx.i18n.t('alertList_titles'),
        Extra
            .HTML(true)
            .markup(instrumentsListKeyboard({page, alertsList}))
    )
}
