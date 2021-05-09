import { CoinGeckoClient } from "./getAllInstruments";

const NodeCache = require("node-cache");

const coinGeckoPriceCache = new NodeCache({
    stdTTL: 60
});

export async function coningeckoGetLasePrice({ instrumentData }) {
    try {
        let currencyPrices = coinGeckoPriceCache.get(instrumentData.ticker);

        if (!currencyPrices) {
            currencyPrices = await CoinGeckoClient.simple.price({
                ids: [instrumentData.sourceSpecificData.id],
                vs_currencies: ['eur', 'usd', 'rub'],
            });

            if (!currencyPrices) {
                throw new Error('Невалидные данные от CoinGecko')
            }

            coinGeckoPriceCache.set(instrumentData.ticker, currencyPrices);
        }

        const price = currencyPrices.data[instrumentData.sourceSpecificData.id]
            ?.[instrumentData.sourceSpecificData?.currency?.toLowerCase() ?? 'usd'];

        if(!price) {
            throw new Error('Невалидные данные от CoinGecko')
        }

        return price;
    } catch (e) {
        throw new Error('Ошибка получения данных от CoinGecko')
    }
}
