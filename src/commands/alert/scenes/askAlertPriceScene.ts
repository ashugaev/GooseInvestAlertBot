import { immediateStep, waitMessageStep } from '@scenes';
import * as WizardScene from 'telegraf/scenes/wizard';

import { getPricesFromString } from '../../../helpers/getPricesFromString';
import { i18n } from '../../../helpers/i18n';
import { getLastPriceById } from '../../../helpers/stocksApi';
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency';
import { ALERT_SCENES } from '../alert.constants';

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

const validateAndSaveStep = waitMessageStep('ask-alert-price-validate-and-save', (ctx, message, state) => {
  const {
    price: lastPrice,
    callback
  } = state;

  const { prices, invalidValues } = getPricesFromString({
    string: message,
    lastPrice
  });

  if (invalidValues.length) {
    const invalidPricesString = invalidValues.join(' ,');

    ctx.replyWithHTML(i18n.t('ru', 'alert_add_choosePrice_invalid', {
      invalid: invalidPricesString
    }));

    return ctx.wizard.selectStep(ctx.wizard.cursor);
  }

  if (!invalidValues.length && !prices.length) {
    ctx.replyWithHTML(i18n.t('ru', 'alert_add_choosePrice_invalid'));

    return ctx.wizard.selectStep(ctx.wizard.cursor);
  }

  callback({ prices, currentPrice: lastPrice });

  return ctx.scene.leave();
});

export const askAlertPriceScene = new WizardScene(ALERT_SCENES.askPrice,
  requestStep,
  validateAndSaveStep
);
