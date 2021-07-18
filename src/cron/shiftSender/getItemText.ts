import { i18n } from '../../helpers/i18n'
import { plur } from '../../helpers/plural'
import { getInstrumentLink } from '../../helpers/getInstrumentLInk'

export const getItemText = (data) => {
  const isFall = data.fallPercent > data.growPercent
  const percent = isFall
    ? data.fallPercent
    : data.growPercent
  const action = isFall
    ? i18n.t('ru', 'fall')
    : i18n.t('ru', 'grow')

  const { type, ticker, source } = data.instrument

  const text = i18n.t('ru', 'shift_alert_message_item', {
    name: data.instrument.name,
    ticker: data.instrument.ticker,
    percent: plur.percent(percent),
    link: getInstrumentLink({ type, ticker, source }),
    action
  })

  return text
}
