import { get, set } from 'lodash';

import { getInstrumentLink } from '../../../helpers/getInstrumentLInk';
import { i18n } from '../../../helpers/i18n';
import { log } from '../../../helpers/log';
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency';
import { alertEditKeyboard } from '../keyboards/alertEditKeyboard';
import { ListActionsDataKeys } from '../list.types';

const logPrefix = '[ALERT EDIT]';

/**
 * Экшен перехода на страницу списка инструментов
 */
export const alertEdit = async (ctx) => {
  try {
    const {
      [ListActionsDataKeys.selectedAlertId]: selectedAlertId
      // Индекс алерта на текущей странице
      // i,
      // p: page,
      // tp: tickersPage
    } = JSON.parse(ctx.match[1]);

    const alertsList = get(ctx, 'session.listCommand.data.alertsList');

    const alert = alertsList
      .find(item => item._id.toString() === selectedAlertId);

    if (!alert) {
      throw new Error(logPrefix + 'Алерт не найдет');
    }

    // Проставяем id алерта для которого открыли редактирование
    set(ctx, 'session.listCommand.price.selectedAlertId', alert._id);

    const message = i18n.t('ru', 'alertsList_editOne', {
      name: alert.name,
      symbol: alert.symbol,
      growth: Boolean(alert.greaterThen),
      price: alert.lowerThen || alert.greaterThen,
      currency: symbolOrCurrency(alert.currency),
      link: alert.type && getInstrumentLink({ type: alert.type, ticker: alert.symbol, source: alert.source }),
      message: alert.message
    });

    const keyboard = alertEditKeyboard({
      // page,
      // tickersPage,
      tickerId: alert.tickerId,
      ctx
    });

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: keyboard
      }
    }
    );
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'));
    log.error(e);
  }
};
