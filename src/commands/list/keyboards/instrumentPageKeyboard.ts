import { Markup } from 'telegraf';

import { Actions } from '../../../constants';
import { createActionString } from '../../../helpers/createActionString';
import { i18n } from '../../../helpers/i18n';
import { backButton } from '../../../keyboards/backButton';
import { paginationButtons } from '../../../keyboards/paginationButtons';
import { EListTypes } from '../list.types';
import { getAlertNumberByPage } from '../utils/showInstrumentPage';
import { alertsTypeToggleButtons } from './alertsTypeToggleButtons';

export enum EKeyboardModes {
  edit = 'e'
}

/**
 * Клавиши для страницы с алертами одного инструмента
 *
 * Используется и для шифтов
 */
// TODO: В пагинации передавать признак withoutBackButton в экшен
export const instrumentPageKeyboard = (ctx, {
  page,
  itemsLength,
  symbol = null,
  withoutBackButton,
  keyboardMode = EKeyboardModes.edit,
  itemsToShowLength,
  showAlertsTypeToggler = false,
  currentListType = EListTypes.levels,
  paginationButtonsConfig,
  editNumberButtonsConfig,
  editButtonConfig,
  tickersPage = 0
}) => {
  const keys = [];

  const isEditMode = keyboardMode === EKeyboardModes.edit;

  // Получаю кнопки пагинации (стрелки)
  const paginatorButtons = paginationButtons({
    itemsLength,
    ...paginationButtonsConfig
  });

  // Добавляем стрелки
  keys.push(paginatorButtons);

  if (isEditMode) {
    const editListButtons = Array.from(new Array(itemsToShowLength)).map((_, i) => {
      const payload = {
        // p: page,
        // i,
        // tp: tickersPage,
        ...(editNumberButtonsConfig.payload || {}),
        ...(editNumberButtonsConfig?.payloadCallback?.(i) || {})
      };

      return (
        Markup.callbackButton(
          (getAlertNumberByPage({ i, page })).toString(),
          createActionString(editNumberButtonsConfig.action, payload)
        )
      );
    });

    // Цифры редактирования алерта
    keys.push(editListButtons);
  } else {
    const payload = {
      // p: page,
      // kMode: EKeyboardModes.edit,
      // tp: tickersPage,
      ...(editButtonConfig.payload || {})
    };

    keys.push([Markup.callbackButton(
      i18n.t('ru', 'button_edit'),
      createActionString(editButtonConfig.action, payload)
    )]);
  }

  if (symbol) {
    const backButtonAction = createActionString(Actions.list_instrumentsPage, { p: tickersPage });

    !withoutBackButton && (keys.push([backButton({ action: backButtonAction })]));
  }

  if (showAlertsTypeToggler) {
    keys.push(alertsTypeToggleButtons({ listType: currentListType }));
  }

  return Markup.inlineKeyboard(keys);
};
