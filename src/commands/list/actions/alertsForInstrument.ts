import { set } from 'lodash';

import { log } from '../../../helpers/log';
import { ListActionsDateKeys } from '../list.types';
import { fetchAlerts } from '../utils/fetchAlerts';
import { showInstrumentPage } from '../utils/showInstrumentPage';

/**
 * Экшен перехода на страницу списка инструментов
 *
 * Страницы для ценового уровня
 */
export const alertsForInstrument = async (ctx) => {
  try {
    const {
      [ListActionsDateKeys.selectedTickerId]: selectedTickerId,
      p: page,
      kMode: keyboardMode,
      tp: tickersPage
    } = JSON.parse(ctx.match[1]);

    set(ctx, 'session.listCommand.price.selectedTickerId', selectedTickerId);

    const { alertsList } = await fetchAlerts({ tickerId: selectedTickerId, ctx, noContextUpdate: true });

    await showInstrumentPage({
      page,
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
