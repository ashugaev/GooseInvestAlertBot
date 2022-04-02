import { ValidatorResult } from '@types';
import { TelegrafContext } from 'telegraf/typings/context';

import { getPricesFromString } from '../../../helpers/getPricesFromString';
import { i18n } from '../../../helpers/i18n';

export interface ValidateAlertPriceParams {
  message: string
  lastPrice: number
  ctx: TelegrafContext
}

/**
 * Валидирует список цен введенный юзером
 */
export const validateAlertPrice = async ({ message, lastPrice, ctx }: ValidateAlertPriceParams): Promise<ValidatorResult> => {
  const { prices, invalidValues } = getPricesFromString({
    string: message,
    lastPrice
  });

  let isValid = true;

  if (invalidValues.length) {
    const invalidPricesString = invalidValues.join(' ,');

    await ctx.replyWithHTML(i18n.t('ru', 'alert_add_choosePrice_invalid', {
      invalid: invalidPricesString
    }));

    isValid = false;
  }

  if (!invalidValues.length && !prices.length) {
    await ctx.replyWithHTML(i18n.t('ru', 'alert_add_choosePrice_invalid'));

    isValid = false;
  }

  return {
    isValid,
    normalized: prices,
    value: message
  };
};
