import {Context} from "telegraf";
import {log} from "./log";
import {i18n} from "./i18n";

interface GetPriceFromStringParams {
    string: string,
    lastPrice: number,
    ctx: Context,
    currency: string,
}

export function getPricesFromString({string, lastPrice, ctx, currency}: GetPriceFromStringParams): number[] {
    const relativeValueMinusRegExp = new RegExp(/^.*\-([\d\.]+).*$/);
    const relativeValuePlusRegExp = new RegExp(/^.*\+([\d\.]+).*$/);

    const prices = string.split(' ').reduce((acc, el) => {
        let val;

        const plusMatch = el.match(relativeValuePlusRegExp);
        const minusMatch = el.match(relativeValueMinusRegExp);

        // normalize elem if it with + -
        if (plusMatch) {
            val = lastPrice + parseFloat(plusMatch[1])
        } else if (minusMatch) {
            val = lastPrice - parseFloat(minusMatch[1]);

            if (val < 0) {
                log.info('Слишком маленькое значение цены');

                ctx.replyWithHTML(i18n.t('ru', 'alertAddErrorLowerThenZero'));

                val = null
            }
        } else {
            val = parseFloat(el);
        }

        val && acc.push(+val.toFixed(4))

        return acc
    }, []);

    return prices;
}
