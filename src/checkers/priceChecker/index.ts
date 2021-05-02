import { wait } from '../../helpers/wait'
import { getCurrentPrice, getHistoricalPrices } from "../../helpers/yahooApi";
import { getAllInstruments } from "../../marketApi";
import { getUniqSymbols, checkAlerts, getAlerts, removePriceAlert } from "../../models";
import { getLastPrice } from "../../helpers/stocksApi";
import { i18n } from '../../helpers/i18n'
import { log } from '../../helpers/log';
import { getInstrumentLink } from "../../helpers/getInstrumentLInk";
const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

/**
 * Before
 *
 * - Проверить зпросы на получение всех инсрументов
 * - Проверить запрос на получение цены по инструменту
 *
 */

// 0. Иду в базу и получаю алерты для всех источником
// 2. Запускаю асинхронные итераторы которые будут ходить в разные источники
// 3. дожидаюсь

(async () => {
    // const instr = await tinkoffGetAllInstruments();

    // console.log('getAllInstruments', instr);

    // let dataCoin = await CoinGeckoClient.simple.price({
    //     ids: ['bitcoin', 'ethereum'],
    //     vs_currencies: ['eur', 'usd', 'rub'],
    // });

    // let dataCoin = await CoinGeckoClient.exchangeRates.all({
    //     ids: ['bitcoin', 'ethereum'],
    //     vs_currencies: ['eur', 'usd', 'rub'],
    // });

    // const data2 = await getAllInstruments();
    //
    // console.log('datacoin', data2);
    //
    // // @ts-ignore
    // const data = await getCurrentPrice('AAPL');
    // // @ts-ignore
    // const data1 = await getHistoricalPrices(0, 6, 2020, 0, 8, 2020, 'AAPL', '1d');
    // console.log('kekkek', data, data1); // { currency: 'USD', price: 132.05 }
})()

export const setupPriceChecker = async (bot) => {
    // Ожидание преред запуском что бы не спамить на хотрелоаде
    await wait(10000);

    // Иду в базу и получаю алерты для всех источником

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

            let removeAlertsForSymbol = false;
            let price;

            try {
                const data = await getLastPrice(symbol);
                price = data.lastPrice

                const isPriceValidValue = typeof price === "number" && price > 0;

                if (!isPriceValidValue) continue;
            } catch (e) {
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


            const triggeredAlerts = await checkAlerts({ symbol, price });

            if (triggeredAlerts.length) {
                log.debug('Сработали алерты', triggeredAlerts, ' Цена: ', price, ' Символ:', symbol);
            }

            for (let j = 0; triggeredAlerts.length > j; j++) {
                const alert = triggeredAlerts[j];
                const { message, symbol, lowerThen, greaterThen, type } = alert;
                const price = lowerThen || greaterThen;

                try {
                    // TODO: Удалаять алерт после нескольки падений отправки
                    await removePriceAlert({ _id: alert._id })

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
                } catch (e) {
                    log.error('Ошибка отправки сообщения юзеру', e)
                }
            }
        }
    }
}
