import * as Sentry from "@sentry/node";
import { MarketInstrument } from "@tinkoff/invest-openapi-js-sdk/build/domain";

const NodeCache = require("node-cache");

const OpenAPI = require('@tinkoff/invest-openapi-js-sdk');
import { log } from "./log";

const apiURL = 'https://api-invest.tinkoff.ru/openapi';
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
const secretToken = process.env.STOCKS_API_TOKEN;

export const stocksApi = new OpenAPI({ apiURL, secretToken, socketURL });

export interface GetLastPriceData extends MarketInstrument {
    lastPrice: number
}

const tinkoffSentryTags = {
    section: "tinkoffApiQuotaExceeded",
}

const symbolInfoCache = new NodeCache({
    // Кэшируем на всегда (обновится при только после перезапуска контейнера)
    // TODO: Возможно это имеет смысл хранить в базе, эти данные вероятно не изменятся никогда
    stdTTL: 0
});

export const getInfoBySymbol = (symbol: string) => new Promise<MarketInstrument>(async (rs, rj) => {
    try {
        let data = symbolInfoCache.get(symbol);

        if (!data) {
            data = await stocksApi.searchOne({ ticker: symbol });

            symbolInfoCache.set(symbol, data);
        }

        if (data === null) {
            rj({
                cantFind: true,
                message: `Заданный инструмент ${symbol} не найден у брокера`
            });

            return;
        }

        rs(data);
    } catch (e) {
        Sentry.captureException('Ошибка ответа тиньковской апишски', {
            tags: tinkoffSentryTags
        });

        log.error(e);
        rj(e);
    }
})

const candlesCache = new NodeCache({
    stdTTL: 40
});

export const getLastPrice = (symbol: string) => new Promise<GetLastPriceData>(async (rs, rj) => {
    try {
        const data = await getInfoBySymbol(symbol);

        const dateTo = new Date();
        const dateToISO = dateTo.toISOString();

        dateTo.setMonth(dateTo.getMonth() - 2)

        const dateFromISO = dateTo.toISOString();

        let candles = candlesCache.get(symbol);

        if (!candles) {
            const candlesData = await stocksApi.candlesGet({
                from: dateFromISO,
                to: dateToISO,
                interval: 'month',
                figi: data.figi,
            })

            candles = candlesData.candles;

            candlesCache.set(symbol, candlesData.candles)
        }

        const lastCandle = candles[candles.length - 1];

        rs({ lastPrice: lastCandle.c, ...data });
    } catch (e) {
        Sentry.captureException('Ошибка ответа тиньковской апишски', {
            tags: tinkoffSentryTags
        });

        log.error(e);
        rj(e)
    }
})
