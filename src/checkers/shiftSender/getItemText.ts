import {i18n} from "../../helpers/i18n";
import {plur} from "../../helpers/plural";

const getInstrumentLink = (type, ticker) => {
    type = type.toLowerCase();

    return `https://www.tinkoff.ru/invest/${type}/${ticker}/`;
}

export const getItemText = (data) => {
    const isFall = data.fallPercent > data.growPercent;
    const percent = isFall
        ? data.fallPercent
        : data.growPercent
    const action = isFall
        ? i18n.t('ru', 'fall')
        : i18n.t('ru', 'grow')

    const text = i18n.t('ru', 'shift_alert_message_item', {
        name: data.instrument.name,
        ticker: data.instrument.ticker,
        percent: plur.percent(percent),
        // + s что бы сделать множественное число
        link: getInstrumentLink(data.instrument.type + 's', data.instrument.ticker),
        action,
    })

    return text;
}
