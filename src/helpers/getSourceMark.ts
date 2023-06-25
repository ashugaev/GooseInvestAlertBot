import { SOURCE_CONFIG } from '@/constants/sourceConfig'
import { InstrumentsList } from '@/models'

import { getInstrumentLink } from './getInstrumentLInk'

// Returns string or html link. Format: [SHOUT_NAME]
// Minimal params: { source: EMarketDataSources }
export const getSourceMark = (
  instrumentData: Partial<InstrumentsList>,
  noLink?: boolean
) => {
  const { source } = instrumentData

  if (!source) return null

  let res = '[' + SOURCE_CONFIG[instrumentData.source].shortName + ']'

  if (!noLink) {
    const link = getInstrumentLink(instrumentData)

    if (link) {
      res = `<a href="${link}" >${res}</a>`
    }
  }

  return res
}
