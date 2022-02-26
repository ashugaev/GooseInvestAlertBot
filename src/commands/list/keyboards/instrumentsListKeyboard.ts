import { Markup } from 'telegraf';

import { listConfig } from '../../../config';
import { Actions } from '../../../constants';
import { createActionString } from '../../../helpers/createActionString';
import { paginationButtons } from '../../../keyboards/paginationButtons';
import { getTimeShiftsCountForUser, PriceAlert } from '../../../models';
import { EListTypes, ListActionsDateKeys } from '../list.types';
import { alertsTypeToggleButtons } from './alertsTypeToggleButtons';
import { EKeyboardModes } from './instrumentPageKeyboard';

/**
 * Вернет список кнопок для каждого инструмента по массиву данных
 *
 * TODO: Возможно стоит объединить клавиатуры instrumentPageKeyboard и instrumentsListKeyboard
 */
export const instrumentsListKeyboard = async ({
  uniqTickersData,
  page,
  listType = EListTypes.levels,
  user = null
}) => {
  // Тикеры которые выведем на это странице
  const pageTickers: PriceAlert[] = uniqTickersData.slice(page * listConfig.itemsPerPage, (page + 1) * listConfig.itemsPerPage);

  // Генерит инлайн кнопки по тикерам
  const getTickerButtons = pageTickers.map(({ name, symbol, tickerId }) => {
    const payload = {
      [ListActionsDateKeys.selectedTickerId]: tickerId,
      p: 0,
      tp: page,
      kMode: EKeyboardModes.edit
    };

    return ([
      Markup.callbackButton(
                `${name} (${symbol})`,
                createActionString(Actions.list_tickerPage, payload)
      )
    ]);
  });

  // Получаю кнопки пагинации
  const paginatorButtons = paginationButtons({
    itemsLength: uniqTickersData.length,
    action: Actions.list_instrumentsPage,
    payload: {
      p: page
    }
  });

  getTickerButtons.push(paginatorButtons);

  const userShiftsCount = user ? await getTimeShiftsCountForUser(user) : 0;

  if (userShiftsCount > 0) {
    getTickerButtons.push(alertsTypeToggleButtons({ listType }));
  }

  return Markup.inlineKeyboard(getTickerButtons);
};
