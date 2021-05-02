const CoinGecko = require('coingecko-api');
import { EMarketDataSources, EMarketInstrumentTypes, IBaseInstrumentData } from "../../types";

const CoinGeckoClient = new CoinGecko();

const normalizeCoingeckoItem = (item): IBaseInstrumentData => {
    return {
        source: EMarketDataSources.coingecko,
        name: item.name,
        ticker: item.symbol,
        type: EMarketInstrumentTypes.Crypto,
        sourceSpecificData: {
            id: item.id
        }
    }
}

export const coingeckoGetAllInstruments = async () => {
    const result = await CoinGeckoClient.coins.list();

    return result.data.map(normalizeCoingeckoItem);
}


