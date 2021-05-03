import { CoinGeckoClient } from "./getAllInstruments";

const NodeCache = require("node-cache");

const coinGeckoPriceCache = new NodeCache({
    stdTTL: 60
});

export async function coningeckoGetLasePrice({ instrumentData }) {
    try {
        let price = coinGeckoPriceCache.get(instrumentData.ticker);

        if (!price) {
            const result = await CoinGeckoClient.simple.price({
                ids: [instrumentData.sourceSpecificData.id],
                vs_currencies: ['eur', 'usd', 'rub'],
            });

            price = result.data[instrumentData.sourceSpecificData.id]
                ?.[instrumentData.sourceSpecificData?.currency?.toLowerCase()];

            if (!price) {
                throw new Error('Невалидные данные от CoinGecko')
            }

            coinGeckoPriceCache.set(instrumentData.ticker, price);
        }

        return price;
    } catch (e) {
        throw new Error('Ошибка получения данных от CoinGecko')
    }
}
