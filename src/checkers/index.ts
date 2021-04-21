import {setupPriceChecker} from "./priceChecker";
import {createShitEvents} from "./shiftChecker";
import {startCronJob} from "../helpers/startCronJob";
import {shiftSender} from "./shiftSender";

export const setupCheckers = (bot) => {
    startCronJob({
        name: 'Check shifts',
        callback: createShitEvents,
        callbackArgs: [bot],
        // раз в день в 2 часа 0 минут
        period: '0 2 * * *',
    })

    startCronJob({
        name: 'Send shifts',
        callback: shiftSender,
        callbackArgs: [bot],
        // раз в час
        period: '0 * * * *',
    })

    // Непрерывные проверки цен
    setupPriceChecker(bot);
}
