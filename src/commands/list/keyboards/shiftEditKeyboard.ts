import { Markup } from 'telegraf';

import { Actions } from '../../../constants';
import { createActionString } from '../../../helpers/createActionString';
import { i18n } from '../../../helpers/i18n';
import { backButton } from '../../../keyboards/backButton';
import { getShiftConfigKeyboard } from '../../shift/shift.keyboards';
import { ListActionsDataKeys } from '../list.types';
import { EKeyboardModes } from './instrumentPageKeyboard';

/**
 * Клавиатура редактирования шифта
 */
export const shiftEditKeyboard = ({ page, shiftData }) => {
  let keys = [];

  const shiftConfig = {
    muted: shiftData.muted,
    growAlerts: shiftData.growAlerts,
    fallAlerts: shiftData.fallAlerts,
    [ListActionsDataKeys.selectedAlertId]: shiftData._id,
    p: page
  };

  const editKeyboard = getShiftConfigKeyboard(shiftConfig, Actions.list_shiftEditPage, {
    buttonsOnly: true
  });

  keys = keys.concat(editKeyboard);

  keys.push([Markup.callbackButton(
    i18n.t('ru', 'button_delete'),
    createActionString(Actions.list_shiftDeleteOne, {
      id: shiftData._id,
      p: page
    })
  )]);

  keys.push([backButton({
    action: createActionString(Actions.list_shiftsPage, {
      p: page,
      kMode: EKeyboardModes.edit
    })
  })]);

  return keys;
};
