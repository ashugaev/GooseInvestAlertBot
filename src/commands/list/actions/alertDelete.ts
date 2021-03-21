import {removePriceAlert} from "../../../models";
import {i18n} from "../../../helpers/i18n";
import {showInstrumentPage} from "../utils/showInstrumentPage";
import {fetchAlerts} from "../utils/fetchAlerts";
import {Extra} from "telegraf";
import {instrumentsListKeyboard} from "../keyboards/instrumentsListKeyboard";

export const alertDelete = async (ctx) => {
    const {idI, s: symbol} = JSON.parse(ctx.match[1]);

    const alertsList = ctx.session.listCommand.alertsList;

    const _id = alertsList[idI];

    await removePriceAlert({_id});

    ctx.replyWithHTML(i18n.t('ru', 'alertList_deleted'))

    debugger;

    const data = await fetchAlerts({ctx});

    const instrumentItems = data.alertsList.filter(item => item.symbol === symbol);

    debugger;

    // Если у инструмента еще остались алерты, то покажем их, если нет, то идем на список инструментов
    if(instrumentItems.length) {
        showInstrumentPage({page: 0, symbol, ctx, instrumentItems, edit: true});
    } else if (data.uniqTickersData.length) {
        ctx.editMessageText(ctx.i18n.t('alertList_titles'),
            Extra
                .HTML(true)
                .markup(instrumentsListKeyboard({page: 0, uniqTickersData: data.uniqTickersData}))
        )
    } else {
        ctx.deleteMessage();
    }
}
