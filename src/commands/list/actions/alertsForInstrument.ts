import { log } from '../../../helpers/log';
import { fetchAlerts } from '../utils/fetchAlerts';
import { showInstrumentPage } from '../utils/showInstrumentPage';

/**
 * Экшен перехода на страницу списка инструментов
 *
 * Страницы для ценового уровня
 */
export const alertsForInstrument = async (ctx) => {
  try {
    const { s: symbol, p: page, kMode: keyboardMode, tp: tickersPage } = JSON.parse(ctx.match[1])

    const { alertsList } = await fetchAlerts({ forSymbol: symbol.toUpperCase(), ctx, noContextUpdate: true })

    await showInstrumentPage({
      page,
      symbol,
      ctx,
      instrumentItems: alertsList,
      edit: true,
      keyboardMode,
      tickersPage
    });
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'));
    log.error(e);
  }
};
