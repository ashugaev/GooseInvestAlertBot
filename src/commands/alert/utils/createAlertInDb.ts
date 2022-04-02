import { TelegrafContext } from 'telegraf/typings/context';

import { i18n } from '../../../helpers/i18n';
import { log } from '../../../helpers/log';
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency';
import { AddPriceAlertParams, addPriceAlerts } from '../../../models';
import { AddAlertPayload } from '../alert.types';

type CreateAlertInDbPayload = Partial<AddAlertPayload>;

interface CreateAlertInDbParams {
  ctx: TelegrafContext
  payload: CreateAlertInDbPayload
  callback: (payload: AddAlertPayload) => void
}

/**
 * Отправляет данные об алерте в базу и сообщает об это юзеру
 */
export const createAlertInDb = async ({ ctx, payload, callback }: CreateAlertInDbParams) => {
  try {
    const { id: user } = ctx.from;
    const { instrumentsList, prices, currentPrice } = payload;

    const instrumentData = instrumentsList[0];

    const newAlerts = [];
    const addedPrices: number[] = [];

    for (let i = 0, l = prices.length; l > i; i++) {
      const price = prices[i];

      const params: AddPriceAlertParams = {
        user,
        tickerId: instrumentData.id,
        symbol: instrumentData.ticker,
        name: instrumentData.name,
        currency: instrumentData.currency,
        type: instrumentData.type,
        source: instrumentData.source,
        initialPrice: currentPrice
      };

      currentPrice < price
        ? (params.greaterThen = price)
        : (params.lowerThen = price);

      newAlerts.push(params);
      addedPrices.push(price);
    }

    const createdItemsList = await addPriceAlerts(newAlerts);

    // Поидее невероятный сценарий и должен быть эксепшен
    if (!createdItemsList.length) {
      await ctx.replyWithHTML(i18n.t('ru', 'alertAddError'));

      // Прерываем добавление
      return;
    }

    const i18nParams = {
      price: addedPrices.map((el) => `${el}${symbolOrCurrency(instrumentData.currency)}`).join(', '),
      symbol: instrumentData.ticker,
      name: instrumentData.name,
      onePrice: createdItemsList.length === 1,
      invalid: null
    };

    await ctx.replyWithHTML(i18n.t('ru', 'alertCreated', i18nParams));

    callback({ createdItemsList });
  } catch (e) {
    log.error('Ошибка добавления алерта', e);
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'));
  }
};
