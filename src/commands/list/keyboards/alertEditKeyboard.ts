import { Markup } from 'telegraf';

import { Actions } from '../../../constants';
import { createActionString } from '../../../helpers/createActionString';
import { i18n } from '../../../helpers/i18n';
import { backButton } from '../../../keyboards/backButton';
import { EKeyboardModes } from './instrumentPageKeyboard';

export const alertEditKeyboard = ({ idI, symbol, page, tickersPage, tickerId }) => {
  const keys = [];

  const deleteButton = Markup.callbackButton(
    i18n.t('ru', 'button_delete'),
    createActionString(Actions.list_deleteAlert, { idI, s: symbol })
  );

  keys.push([deleteButton]);

  keys.push([backButton({
    action: createActionString(Actions.list_tickerPage, {
      s: symbol, p: page, kMode: EKeyboardModes.edit, tp: tickersPage
    })
  })]);

  return keys;
};
