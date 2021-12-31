import { getInstrumentInfoByTicker } from '../../../models';
import { COMMON_SCENES } from '../../../scenes/scenes.constants';
import { ALERT_SCENES } from '../alert.constants';
import { AddAlertPayload } from '../alert.types';
import { attachMessageToAlert } from '../utils/attachMessageToAlert';
import { createAlertInDb } from '../utils/createAlertInDb';

/**
 * Ф-ция добавления алерта
 * Если на входе недостаточно данных она их запрашивает у юзера
 *
 * TODO: Можно сделать утилиту которая будет вызывать ифаки последовательно
 *  Под капотом это может быть генератор
 */
export function addAlertScenario (ctx, payload: AddAlertPayload) {
  // Состояние в замыкании, которое сохранится между вызовами nextStep
  let state: AddAlertPayload = payload;

  (function nextStep (payloadUpdate) {
    state = { ...state, ...payloadUpdate };

    const {
      prices,
      ticker,
      instrumentsList,
      message,
      alertCreated,
      messageAttached,
      currentPrice,
      createdItemsList
    } = state;

    // Спросим тикер, если его нет
    if (!ticker) {
      ctx.scene.enter(ALERT_SCENES.askTicker, {
        payload: {},
        callback: nextStep
      });

      return;
    }

    // Подтянет список инструментов, если его не было
    if (ticker && !instrumentsList) {
      (async () => {
        const instrumentsList = await getInstrumentInfoByTicker({ ticker });

        nextStep({ instrumentsList });
      })();

      return;
    }

    // Предложим выбрать монету, если по этому тикеру их несколько
    if (instrumentsList?.length > 1) {
      ctx.scene.enter(COMMON_SCENES.tickerDuplicates, {
        payload: { instrumentsList },
        callback: nextStep
      });

      return;
    }

    // Спросим цену, если её нет
    if (!prices && instrumentsList && ticker) {
      ctx.scene.enter(ALERT_SCENES.askPrice, {
        payload: { instrumentsList },
        callback: nextStep
      });

      return;
    }

    // Как только собрали основные данные
    if (prices?.length && instrumentsList?.length === 1 && currentPrice && !alertCreated) {
      createAlertInDb({
        ctx,
        payload: { instrumentsList, prices, currentPrice },
        callback: (arg) => {
          state.alertCreated = true;
          nextStep(arg);
        }
      });

      return;
    }

    // Если нет сообщения от юзера
    if (!message && createdItemsList?.length === 1) {
      ctx.scene.enter(ALERT_SCENES.askMessage, {
        payload: { createdItemsList },
        callback: nextStep
      });

      return;
    }

    // Если сообщение есть, но не отправлено в базу
    if (!messageAttached && message) {
      const _id = createdItemsList[0]._id;

      attachMessageToAlert(ctx, { message, _id }, (arg) => {
        state.messageAttached = true;
        nextStep(arg);
      });
    }
  })();
};
