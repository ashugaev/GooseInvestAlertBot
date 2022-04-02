import { IMarketDataSourcesConfig } from './types'
import { EMarketDataSources } from '../models'

/**
 * Источники из которых получаем котировки
 */
export const MARKET_DATA_SOURCES_CONFIG: IMarketDataSourcesConfig[] = [
  {
    name: EMarketDataSources.tinkoff,
    requestsPerMinuteLimit: 240
  }, {
    name: EMarketDataSources.coingecko,
    requestsPerMinuteLimit: 100
  }
]

export const TINKOFF_SENTRY_TAGS = {
  section: 'tinkoffApiQuotaExceeded'
}
