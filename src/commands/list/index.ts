import { Context, Extra, Telegraf } from 'telegraf';

import { Actions } from '../../constants';
import { commandWrapper } from '../../helpers/commandWrapper';
import { log } from '../../helpers/log';
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp';
import { alertDelete } from './actions/alertDelete';
import { alertEdit } from './actions/alertEdit';
import { alertsForInstrument } from './actions/alertsForInstrument';
import { instrumentsListPagination } from './actions/instrumentsListPagination';
import { shiftDelete } from './actions/shiftDelete';
import { shiftEditPage } from './actions/shiftEditPage';
import { shiftsPage } from './actions/shiftsPage';
import { instrumentsListKeyboard } from './keyboards/instrumentsListKeyboard';
import { ListCommandState } from './list.types';
import { fetchAlerts } from './utils/fetchAlerts';

export interface ITickerButtonItem {
  name: string
  symbol: string
  currency: string
}

export function setupList (bot: Telegraf<Context>) {
  bot.command('list', commandWrapper(async ctx => {
    const data = ctx.message.text.match(/list\s?(\w+)?$/);

    const { id: user } = ctx.from;

    // Invalid Format
    if (data === null) {
      await ctx.replyWithHTML(ctx.i18n.t('alertListErrorInvalidFormat'));
      return;
    }

    // Дефолтные значения констекста для команды
    ctx.session.listCommand = {
      price: {
        tickersPage: 0,
        tickerAlertsPage: 0,
        selectedTickerId: null,
        selectedAlertId: null
      },
      shifts: {
        page: 0
      },
      data: {
        alertsList: [],
        uniqTickersData: []
      }
    };

    // TODO: Пока что не поддерживается показ по символу. Если будет необходимость можно вернуть отдельным релизом.
    let alertsList;
    let uniqTickersData;

    try {
      // Вернет все алерты юзера и запишет в контекст
      const data = await fetchAlerts({ ctx });

      alertsList = data.alertsList;
      uniqTickersData = data.uniqTickersData;

      if (!alertsList.length) {
        return;
      }
    } catch (e) {
      log.error(e);
      return;
    }

    ctx.replyWithHTML(ctx.i18n.t('alertList_titles'),
      Extra
        .HTML(true)
        .markup(await instrumentsListKeyboard({
          page: 0,
          uniqTickersData,
          user,
          ctx,
        }))
    );

    /*
        // TODO: Пока что не поддерживается показ по символу. Если будет необходимость можно вернуть отдельным релизом.
        const forSymbol = data[1];

        if (forSymbol) {
          showInstrumentPage({ page: 0, symbol: forSymbol, ctx, instrumentItems: alertsList, edit: false });
        } else {
          ctx.replyWithHTML(ctx.i18n.t('alertList_titles'),
            Extra
              .HTML(true)
              .markup(await instrumentsListKeyboard({ page: 0, uniqTickersData, user, ctx}))
          );
        }
         */
  }));

  // Управление состоянием страницы одного инструмента
  bot.action(triggerActionRegexp(Actions.list_tickerPage), alertsForInstrument);
  // Страница редактирования шифта
  bot.action(triggerActionRegexp(Actions.list_shiftEditPage), shiftEditPage);
  // Удалить шифт
  bot.action(triggerActionRegexp(Actions.list_shiftDeleteOne), shiftDelete);
  bot.action(triggerActionRegexp(Actions.list_editAlert), alertEdit);
  bot.action(triggerActionRegexp(Actions.list_deleteAlert), alertDelete);
  // Пагинация по списку тикеров (верхнеуровневая)
  bot.action(triggerActionRegexp(Actions.list_instrumentsPage), instrumentsListPagination);
  // Режим просмотра шифтов
  bot.action(triggerActionRegexp(Actions.list_shiftsPage), shiftsPage);
}
