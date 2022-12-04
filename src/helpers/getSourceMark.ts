import { EMarketDataSources } from '../marketApi/types'

export const getSourceMark = (source: EMarketDataSources) => {
  if (!source) return null

  return '[' + source.toUpperCase() + ']'
}
