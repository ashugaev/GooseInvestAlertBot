import { TelegrafContext } from 'telegraf/typings/context';

import { COMMON_SCENES } from '../../../scenes/scenes.constants';
import { ALERT_SCENES } from '../alert.constants';
import { AddAlertPayload } from '../alert.types';
import { createAlertInDb } from './createAlertInDb';

type AddAlertParams = [
    ctx: TelegrafContext,
    payload: AddAlertPayload
];

/**
 * Ф-ция добавления алерта
 * Если на входе недостаточно данных она их запрашивает у юзера
 *
 * TODO: Можно сделать утилиту которая будет вызывать ифаки последовательно
 *  Под капотом это может быть генератор
 */
export function addAlert (ctx, payload: AddAlertPayload) {
  const {
    prices, ticker, instrumentsList, message, alertCreated, messageAttached, currentPrice, createdItemsList
  } = payload;

  // Только если еще не получен тикер
  if (!ticker) {
    ctx.scene.enter(ALERT_SCENES.askTicker, {
      payload,
      callback: addAlert
    });

    return;
  }

  // Если получили несколько монет по одному тикеру
  if (instrumentsList?.length > 1) {
    ctx.scene.enter(COMMON_SCENES.tickerDuplicates, {
      payload,
      callback: addAlert
    });

    return;
  }

  // Если нет цены
  if (!prices) {
    ctx.scene.enter(ALERT_SCENES.askPrice, {
      payload,
      callback: addAlert
    });

    return;
  }

  // Как только собрали основные данные
  if (prices?.length && instrumentsList?.length === 1 && currentPrice && !alertCreated) {
    createAlertInDb({
      ctx,
      payload,
      callback: addAlert
    });

    return;
  }

  // Если нет сообщения
  if (!message && createdItemsList?.length > 1) {
    return;
  }

  // Если сообщение не отправлено в базу
  if (!messageAttached) {

  }
};
