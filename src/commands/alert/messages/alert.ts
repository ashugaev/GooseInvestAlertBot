import { getSourceMark } from '@/helpers/getSourceMark'
import { getSymbolByTicker } from '@/helpers/getSymbolByTicker'
import { i18n } from '@/helpers/i18n'
import { InstrumentsList, PriceAlert } from '@/models'

export const alertMessage = (
  alert: PriceAlert,
  instrumentData: InstrumentsList
): string => {
  const alertPrice = alert.lowerThen || alert.greaterThen

  return i18n.t('ru', 'priceChecker_triggeredAlert', {
    symbol: instrumentData.ticker,
    name: instrumentData.name,
    currency: getSymbolByTicker(alert.currency),
    greaterThen: alert.greaterThen,
    price: alertPrice,
    message: alert.message,
    link: getSourceMark(instrumentData),
  })
}
