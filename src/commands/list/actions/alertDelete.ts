import { get } from 'lodash';
import { Extra } from 'telegraf';

import { i18n } from '../../../helpers/i18n';
import { log } from '../../../helpers/log';
import { removePriceAlert } from '../../../models';
import { instrumentsListKeyboard } from '../keyboards/instrumentsListKeyboard';
import { fetchAlerts } from '../utils/fetchAlerts';
import { showInstrumentPage } from '../utils/showInstrumentPage';

export const alertDelete = async (ctx) => {
  try {
    const selectedAlertId = get(ctx, 'session.listCommand.price.selectedAlertId');
    // FIXME: Записать этот id в месте, где происходит клик по тикеру в пагинации
    const selectedTickerId = get(ctx, 'session.listCommand.price.selectedTickerId');

    await removePriceAlert({ _id: selectedAlertId });

    ctx.replyWithHTML(i18n.t('ru', 'alertList_deleted'));

    // Повторный фетч для того6 что бы получить обновленный список
    const data = await fetchAlerts({ ctx });

    // FIXME: Фильтровать по id
    const instrumentItems = data.alertsList.filter(item => item.tickerId === selectedTickerId);

    // Если у инструмента еще остались алерты, то покажем их, если нет, то идем на список инструментов
    if (instrumentItems.length) {
      // FIXME: Проставлять страницу
      await showInstrumentPage({
        page: 0,
        instrumentItems,
        ctx,
        edit: true
      });
    } else if (data.uniqTickersData.length) {
      await ctx.editMessageText(ctx.i18n.t('alertList_titles'),
        Extra
          .HTML(true)
          .markup(await instrumentsListKeyboard({ page: 0, uniqTickersData: data.uniqTickersData, ctx }))
      );
    } else {
      ctx.deleteMessage();
    }
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'));
    log.error(e);
  }
};
