import * as Sentry from "@sentry/node";
import { MarketInstrument } from "@tinkoff/invest-openapi-js-sdk/build/domain";
import { coningeckoGetLasePrice } from "../marketApi/coingecko/api/getLastPrice";
import { TINKOFF_SENTRY_TAGS } from "../marketApi/constants";
import { tinkoffGetLastPrice } from "../marketApi/tinkoff/api/getLastPrice";
import { EMarketDataSources, IBaseInstrumentData } from "../marketApi/types";
import { getInstrumentDataWithPrice } from "./getInstrumentData";
import { log } from "./log";

const NodeCache = require("node-cache");
const OpenAPI = require('@tinkoff/invest-openapi-js-sdk');

const apiURL = 'https://api-invest.tinkoff.ru/openapi';
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
const secretToken = process.env.STOCKS_API_TOKEN;

export const stocksApi = new OpenAPI({ apiURL, secretToken, socketURL });

export interface GetLastPriceData extends MarketInstrument {
    lastPrice: number
}

export interface IGetInfoBySymbolParams {
    instrumentData?: IBaseInstrumentData,
    ticker?: string,
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

        // Полагаюсь что data=null признак того, что это успешный ответ от апи и мы просто ничего не нашли по тикеру
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
            tags: TINKOFF_SENTRY_TAGS
        });

        log.error(e);
        rj(e);
    }
})

/**
 * Вернет цену по instrumentData
 * Если нет instrumentData, то сходит в базу и достанет его по тикеру
 *
 * TODO: Разбить на getLastPriceByTicker и getLastPriceByInstrumentData
 */
export const getLastPrice = async ({
                                 instrumentData,
                                    ticker
                             }: IGetInfoBySymbolParams) => {
    try {
        if(!instrumentData && !ticker) {
            throw new Error('Необходимо предоставить istrumentData либо ticker для получения последней цены')
        }

        if (!instrumentData) {
            const data = await getInstrumentDataWithPrice({ symbol: ticker });

            instrumentData = data.instrumentData;

            if (!instrumentData) {
                throw new Error('Ошибка получения информации по инструменту');
            }
        }

        let lastPrice;

        if (!instrumentData.source || instrumentData.source == EMarketDataSources.tinkoff) {
            lastPrice = await tinkoffGetLastPrice({ instrumentData });
        } else if (instrumentData.source == EMarketDataSources.coingecko) {
            lastPrice = await coningeckoGetLasePrice({ instrumentData });
        } else {
            throw new Error('Инструмент без параметра source');
        }

        if (!lastPrice) {
            throw new Error('Не была получена последняя цена инструмента');
        }

        return lastPrice;
    } catch (e) {
        throw new Error(e);
    }
}
