import { showInstrumentPage } from '../utils/showInstrumentPage'
import { fetchAlerts } from '../utils/fetchAlerts'

/**
 * Экшен перехода на страницу списка инструментов
 * @param ctx
 */
export const alertsForInstrument = async (ctx) => {
  const { s: symbol, p: page, kMode: keyboardMode } = JSON.parse(ctx.match[1])

  const { alertsList } = await fetchAlerts({ forSymbol: symbol.toUpperCase(), ctx, noContextUpdate: true })

  await showInstrumentPage({
    page,
    symbol,
    ctx,
    instrumentItems: alertsList,
    edit: true,
    keyboardMode
  })
}
