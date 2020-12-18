import * as OpenAPI from '@tinkoff/invest-openapi-js-sdk';
import {log} from "./log";

const apiURL = 'https://api-invest.tinkoff.ru/openapi';
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
const secretToken = process.env.STOCKS_API_TOKEN;

// @ts-ignore
export const stocksApi = new OpenAPI({apiURL, secretToken, socketURL});

export const getLastPrice = (symbol: string): Promise<string> => new Promise(async (rs, rj) => {
    let figi;

    try {
        const result = await stocksApi.searchOne({ticker: symbol});

        if (result === null) {
            rj({
                cantFind: true,
                message: `Заданный инструмент ${symbol} не найден у брокера`
            });

            return;
        }

        figi = result.figi;
    } catch (e) {
        log.error(e);
        rj(e);
    }

    try {
        const dateTo = new Date();
        const dateToISO = dateTo.toISOString();

        dateTo.setMonth(dateTo.getMonth() - 1)

        const dateFromISO = dateTo.toISOString();

        const {candles} = await stocksApi.candlesGet({
            from: dateFromISO,
            to: dateToISO,
            figi,
            interval: 'month',
        })

        const lastCandle = candles[candles.length - 1];

        rs(lastCandle.c);
    } catch (e) {
        log.error(e);
        rj(e)
    }
})
