import { Markup } from 'telegraf';

import { Actions } from '../../../constants';
import { createActionString } from '../../../helpers/createActionString';
import { i18n } from '../../../helpers/i18n';
import { backButton } from '../../../keyboards/backButton';
import { ListActionsDateKeys } from '../list.types';
import { EKeyboardModes } from './instrumentPageKeyboard';

export const alertEditKeyboard = ({ page, tickersPage, tickerId, ctx }) => {
  const keys = [];

  const deleteButton = Markup.callbackButton(
    i18n.t('ru', 'button_delete'),
    createActionString(Actions.list_deleteAlert, {
      [ListActionsDateKeys.selectedTickerId]: tickerId
    })
  );

  keys.push([deleteButton]);

  keys.push([backButton({
    action: createActionString(Actions.list_tickerPage, {
      p: page,
      kMode: EKeyboardModes.edit,
      tp: tickersPage,
      [ListActionsDateKeys.selectedTickerId]: tickerId
    })
  })]);

  return keys;
};
