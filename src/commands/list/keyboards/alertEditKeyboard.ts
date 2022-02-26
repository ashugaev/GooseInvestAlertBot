import { Markup } from 'telegraf';

import { Actions } from '../../../constants';
import { createActionString } from '../../../helpers/createActionString';
import { i18n } from '../../../helpers/i18n';
import { backButton } from '../../../keyboards/backButton';
import { ListActionsDataKeys } from '../list.types';
import { EKeyboardModes } from './instrumentPageKeyboard';

export const alertEditKeyboard = ({ tickerId, ctx }) => {
  const keys = [];

  const deleteButton = Markup.callbackButton(
    i18n.t('ru', 'button_delete'),
    createActionString(Actions.list_deleteAlert, {
      [ListActionsDataKeys.selectedTickerId]: tickerId
    })
  );

  // FIXME: Брать из стора
  const page = 0;
  const tickersPage = 0;

  keys.push([deleteButton]);

  keys.push([backButton({
    action: createActionString(Actions.list_tickerPage, {
      p: page,
      kMode: EKeyboardModes.edit,
      tp: tickersPage,
      [ListActionsDataKeys.selectedTickerId]: tickerId
    })
  })]);

  return keys;
};
