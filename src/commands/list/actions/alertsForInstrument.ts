import {showInstrumentPage} from "../utils/showInstrumentPage";

/**
 * Экшен перехода на страницу списка инструментов
 * @param ctx
 */
export const alertsForInstrument = async (ctx) => {
    const symbol = ctx.match[1];
    const page = Number(ctx.match[2]);

    const instrumentItems = ctx.session.listCommand.alertsList
        .filter(item => item.symbol === symbol);


    showInstrumentPage({page, symbol, ctx, instrumentItems, edit: true});
}
