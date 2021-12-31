import { immediateStep, waitMessageStep } from '@scenes';
import * as WizardScene from 'telegraf/scenes/wizard';

import { i18n } from '../../../helpers/i18n';
import { getInstrumentInfoByTicker } from '../../../models';
import { ALERT_SCENES } from '../alert.constants';

/**
 * Запрашивает у юзера тикер
 */
const requestStep = immediateStep('ask-alert-ticker-request', async (ctx) => {
  ctx.replyWithHTML(i18n.t('ru', 'alert_add_chooseInstrument'));

  return ctx.wizard.next();
});

const validateAndSaveStep = waitMessageStep('ask-alert-price-validate-and-save', async (ctx, message, state) => {
  const {
    callback
  } = state;

  message = message.toUpperCase();

  const instrumentsList = await getInstrumentInfoByTicker({ ticker: message });

  if (!instrumentsList.length) {
    await ctx.replyWithHTML(
      i18n.t('ru', 'alertErrorUnexistedSymbol', { symbol: message }),
      { disable_web_page_preview: true }
    );

    return ctx.wizard.selectStep(ctx.wizard.cursor);
  }

  callback({ ticker: message, instrumentsList });

  return ctx.scene.leave();
});

export const askAlertTickerScene = new WizardScene(ALERT_SCENES.askTicker,
  requestStep,
  validateAndSaveStep
);
