import {MarketInstrument} from "@tinkoff/invest-openapi-js-sdk/build/domain";

const OpenAPI = require('@tinkoff/invest-openapi-js-sdk');
import {log} from "./log";

const apiURL = 'https://api-invest.tinkoff.ru/openapi';
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
const secretToken = process.env.STOCKS_API_TOKEN;

export const stocksApi = new OpenAPI({apiURL, secretToken, socketURL});

export interface GetLastPriceData extends MarketInstrument {
    lastPrice: number
}

export const getInfoBySymbol = (symbol: string) => new Promise<MarketInstrument>(async (rs, rj) => {
    try {
        const data = await stocksApi.searchOne({ticker: symbol});

        if (data === null) {
            rj({
                cantFind: true,
                message: `Заданный инструмент ${symbol} не найден у брокера`
            });

            return;
        }

        rs(data);
    } catch (e) {
        log.error(e);
        rj(e);
    }
})

export const getLastPrice = (symbol: string) => new Promise<GetLastPriceData>(async (rs, rj) => {
    try {
        const data = await getInfoBySymbol(symbol);

        const dateTo = new Date();
        const dateToISO = dateTo.toISOString();

        dateTo.setMonth(dateTo.getMonth() - 2)

        const dateFromISO = dateTo.toISOString();

        const {candles} = await stocksApi.candlesGet({
            from: dateFromISO,
            to: dateToISO,
            interval: 'month',
            figi: data.figi,
        })

        const lastCandle = candles[candles.length - 1];

        rs({lastPrice: lastCandle.c, ...data});
    } catch (e) {
        log.error(e);
        rj(e)
    }
})
