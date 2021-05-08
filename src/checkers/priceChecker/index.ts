import { getInstrumentDataWithPrice } from "../../helpers/getInstrumentData";
import { wait } from '../../helpers/wait'
import { getUniqSymbols, checkAlerts, getAlerts, removePriceAlert } from "../../models";
import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log';
import { getInstrumentLink } from "../../helpers/getInstrumentLInk";

export const setupPriceChecker = async (bot) => {
    // Ожидание преред запуском что бы не спамить на хотрелоаде
    await wait(10000);

    while (true) {
        let symbols = [];

        try {
           symbols = await getUniqSymbols(50);
        } catch (e) {
            log.error('[setupPriceChecker] ошибка подключения к базе', e)
        }

        // Если пока нечего проверять
        if (!symbols?.length) {
            await wait(30000)
            continue;
        } else {
            log.debug('Проверяю символы', symbols)
        }

        for (let i = 0; symbols.length > i; i++) {
            const symbol = symbols[i];

            let removeAlertsForSymbol = false;
            let price;

            try {
                const result = await getInstrumentDataWithPrice({symbol});

                price = result.price;

                const isPriceValidValue = typeof price === "number" && price > 0;

                if (!isPriceValidValue) {
                    throw new Error('Невалидная цена инструмента')
                }
            } catch (e) {
                // Сейчас этот if не будет срабатывать из-за того хожу теперь в базу а не в апи за данными инструмента
                if (typeof e === "object" && e !== null && e.cantFind) {
                    removeAlertsForSymbol = true

                    log.error('Инструмент не найдет в апи', e)
                } else {
                    log.error('Ошибка получания цены для инструмента', e)
                }

                continue;
            }

            // Если инструмента больше нет в апи
            if (removeAlertsForSymbol) {
                log.debug('Удаляю все по символу', symbol);

                const alertsToRemove = await getAlerts({ symbol });

                for (let j = 0; alertsToRemove.length > j; j++) {
                    const alert = alertsToRemove[j];

                    try {
                        // TODO: Удалаять алерт после нескольки падений отправки
                        await removePriceAlert({ _id: alert._id })

                        await bot.telegram.sendMessage(alert.user, i18n.t(
                            'ru', 'priceCheckerErrorCantFind',
                            { price: alert.lowerThen || alert.greaterThen, symbol: alert.symbol }
                            ),
                            {
                                parse_mode: 'HTML'
                            }
                        )
                    } catch (e) {
                        log.error('Ошибка отправки сообщения юзеру', e)
                    }
                }

                continue;
            }


            let triggeredAlerts = [];

            try {
                triggeredAlerts = await checkAlerts({ symbol, price });
            } catch (e) {
                console.error('ошибка получения алертов', 'price', price, 'symbol', symbol, 'error', e);

                continue;
            }

            if (triggeredAlerts?.length) {
                log.debug('Сработали алерты', triggeredAlerts, ' Цена: ', price, ' Символ:', symbol);

                for (let j = 0; triggeredAlerts.length > j; j++) {
                    const alert = triggeredAlerts[j];
                    const { message, symbol, lowerThen, greaterThen, type } = alert;
                    const price = lowerThen || greaterThen;

                    try {
                        await bot.telegram.sendMessage(alert.user,
                            message
                                ? i18n.t('ru', 'priceCheckerTriggeredAlertWithMessage', {
                                    symbol,
                                    price,
                                    message,
                                    link: type && getInstrumentLink(type, symbol),
                                })
                                : i18n.t('ru', 'priceCheckerTriggeredAlert', {
                                    symbol,
                                    price,
                                    link: type && getInstrumentLink(type, symbol),
                                })
                            , {
                                parse_mode: 'HTML',
                                disable_web_page_preview: true
                            })

                        // TODO: Удалаять алерт после нескольки падений отправки
                        await removePriceAlert({ _id: alert._id })
                    } catch (e) {
                        log.error('Ошибка отправки сообщения юзеру', e)
                    }
                }
            }
        }
    }
}
