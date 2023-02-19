import { SOURCE_CONFIG } from '@/constants/sourceConfig'
import { getInstrumentLink } from '@/helpers/getInstrumentLInk'
import { InstrumentsList } from '@/models'

// Returns string or html link. Format: [SHOUT_NAME]
export const getSourceLink = (item: InstrumentsList) => {
  const link: string | undefined = getInstrumentLink({
    type: item.type,
    source: item.source,
    ticker: item.ticker
  }, item)

  let res = '[' + SOURCE_CONFIG[item.source].shortName + ']'

  if (link) {
    res = `<a href="${link}" >${res}</a>`
  }

  return res
}
