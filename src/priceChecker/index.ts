import {wait} from '../helpers/wait'
import {getUniqSymbols, checkAlerts, getAlerts, removePriceAlert} from "../models";
import {getLastPrice} from "../helpers/stocksApi";
import {i18n} from '../helpers/i18n'
import {log} from '../helpers/log';

export const setupPriceChecker = async (bot) => {
    // Ожидание преред запуском что бы не спамить на хотрелоаде
    await wait(10000);

    while (true) {
        const symbols = await getUniqSymbols(50);

        // Если пока нечего проверять
        if (!symbols.length) {
            await wait(30000)
            continue;
        } else {
            log.debug('Проверяю символы', symbols)
        }

        for (let i = 0; symbols.length > i; i++) {
            const symbol = symbols[i];

            let removeAlertsForSybmol = false;
            let price;

            try {
                price = await getLastPrice(symbol);
            } catch (e) {
                if (typeof e === "object" && e !== null) {
                    if (e.cantFind) {
                        removeAlertsForSybmol = true
                    }
                }

                log.error('Ошибка получания цены для инструмента', e)
            }

            if (removeAlertsForSybmol) {
                log.debug('Удаляю все по символу', symbol);

                const alertsToRemove = await getAlerts({symbol});

                for (let j = 0; alertsToRemove.length > j; j++) {
                    const alert = alertsToRemove[j];

                    await removePriceAlert({_id: alert._id})

                    await bot.telegram.sendMessage(alert.user, i18n.t(
                        'ru', 'priceCheckerErrorCantFind',
                        {price: alert.lowerThen || alert.greaterThen, symbol: alert.symbol}
                        ),
                        {
                            parse_mode: 'HTML'
                        }
                    )
                }

                continue;
            }


            const triggeredAlerts = await checkAlerts({symbol, price});

            if (triggeredAlerts.length) {
                console.debug('Сработали алерты', triggeredAlerts,' Цена: ', price, ' Символ:', symbol);
            }

            for (let j = 0; triggeredAlerts.length > j; j++) {
                const alert = triggeredAlerts[j];

                await bot.telegram.sendMessage(alert.user, i18n.t('ru', 'priceCheckerTriggeredAlert', {
                    symbol: alert.symbol,
                    price: alert.lowerThen || alert.greaterThen
                }), {
                    parse_mode: 'HTML'
                })

                await removePriceAlert({_id: alert._id})
            }
        }
    }
}
