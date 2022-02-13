import { immediateStep, waitMessageStep } from '@scenes';
import * as WizardScene from 'telegraf/scenes/wizard';

import { i18n } from '../../../helpers/i18n';
import { getLastPriceById } from '../../../helpers/stocksApi';
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency';
import { ALERT_SCENES } from '../alert.constants';
import { validateAlertPrice } from '../validators';

/**
 * Запрашивает у юзера цену
 *
 * В состоянии нужны параметры
 * - instrumentId
 */
const requestStep = immediateStep('ask-alert-price-request', async (ctx) => {
  const { state } = ctx.wizard;
  const { instrumentsList } = state.payload;

  const instrumentData = instrumentsList[0];
  const instrumentId = instrumentData.id;

  const { source, currency } = instrumentData;

  const price = await getLastPriceById(instrumentId, source);

  state.price = price;

  await ctx.replyWithHTML(i18n.t('ru', 'alert_add_choosePrice', {
    price,
    currency: symbolOrCurrency(currency)
  }));

  return ctx.wizard.next();
});

const validateAndSaveStep = waitMessageStep('ask-alert-price-validate-and-save', async (ctx, message, state) => {
  const {
    price: lastPrice,
    callback
  } = state;

  const { normalized, isValid } = await validateAlertPrice({
    ctx,
    message,
    lastPrice
  });

  if (!isValid) {
    return ctx.wizard.selectStep(ctx.wizard.cursor);
  }

  callback({ prices: normalized, currentPrice: lastPrice });

  return ctx.scene.leave();
});

export const askAlertPriceScene = new WizardScene(ALERT_SCENES.askPrice,
  requestStep,
  validateAndSaveStep
);