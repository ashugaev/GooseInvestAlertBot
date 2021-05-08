import {getShiftEvents, removeShiftEvent} from "../../models/ShiftEvents";
import {i18n} from "../../helpers/i18n";
import {plur} from "../../helpers/plural";
import {getItemText} from "./getItemText";

export const shiftSender = async (bot) => {
    const hour = new Date().getHours();
    const events = await getShiftEvents({time: hour})

    for(let event of events) {
        let message = i18n.t('ru', 'shift_alert_message', {
            percent: plur.percent(event.targetPercent),
            days: plur.days(event.days)
        }) + '\n';

        const {Stock, Etf, Bond} = event.data;

        Stock && (message += i18n.t('ru', 'shift_alert_message_stock', {list: Stock.map(getItemText).join('\n')}))
        Etf && (message += i18n.t('ru', 'shift_alert_message_etf', {list: Etf.map(getItemText).join('\n')}))
        Bond && (message += i18n.t('ru', 'shift_alert_message_bond', {list: Bond.map(getItemText).join('\n')}))

        await bot.telegram.sendMessage(event.user, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        })

        await removeShiftEvent({_id: event._id})
    }
}
