import { tinkoffGetAllInstruments } from "./tinkoff/api/getAllInstruments";
import { EMarketDataSources, IMarketDataSourcesConfig } from "./types";

/**
 * Источники из которых получаем котировки
 */
export const MARKET_DATA_SOURCES_CONFIG: IMarketDataSourcesConfig[] = [
    {
        name: EMarketDataSources.tinkoff,
        requestsPerMinuteLimit: 240,
    }, {
        name: EMarketDataSources.coingecko,
        requestsPerMinuteLimit: 100,
    }
]