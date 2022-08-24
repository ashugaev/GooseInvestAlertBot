import { log } from '@helpers';

import { i18n } from '../../../helpers/i18n';
import { getInstrumentInfoByTicker } from '../../../models';
import { COMMON_SCENES } from '../../../scenes/scenes.constants';
import { ALERT_SCENES } from '../alert.constants';
import { AddAlertPayload } from '../alert.types';
import { attachMessageToAlert } from '../utils/attachMessageToAlert';
import { createAlertInDb } from '../utils/createAlertInDb';

const logPrefix = '[ADD ALERT SCENARIO]';

/**
 * Ф-ция добавления алерта
 * Если на входе недостаточно данных она их запрашивает у юзера
 *
 * TODO: Можно сделать утилиту которая будет вызывать ифаки последовательно
 *  Под капотом это может быть генератор
 *
 * TODO: Оторвать валидация от получения данных, тогда на вход сможем подавать просто данные
 *  без их запроса отдельным шагом
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

    /**
     * Step 1
     * - No ticker
     *
     * Ask user ticker and save it in context
     */
    if (!ticker) {
      ctx.scene.enter(ALERT_SCENES.askTicker, {
        payload: {},
        callback: nextStep
      });

      return;
    }

    /**
     * Step 2
     * - Have ticker
     * - No ticker data from db
     *
     * Find ticker in DB and save results in context
     */
    if (ticker && !instrumentsList?.length) {
      (async () => {
        try {
          const instrumentsList = await getInstrumentInfoByTicker({ ticker });

          if (!instrumentsList.length) {
            await ctx.replyWithHTML(
              i18n.t('ru', 'alertErrorUnexistedSymbol', { symbol: ticker }),
              { disable_web_page_preview: true }
            );

            return;
          }

          nextStep({ instrumentsList });
        } catch (e) {
          log.error(logPrefix, 'add alert scenario crash 1', e);
          await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'));
        }
      })().catch(async (e) => {
        await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'));
        log.error(logPrefix, 'add alert scenario crash', e);
      });

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

    /**
     * Спросим цену, если её нет
     */
    if (!prices && instrumentsList.length === 1 && ticker) {
      ctx.scene.enter(ALERT_SCENES.askPrice, {
        payload: { instrumentsList },
        callback: nextStep
      });

      return;
    }

    // Как только собрали основные данные
    if (prices?.length && instrumentsList?.length === 1 && currentPrice && !alertCreated) {
      // FIXME: need await?
      createAlertInDb({
        ctx,
        payload: { instrumentsList, prices, currentPrice },
        callback: (arg) => {
          state.alertCreated = true;
          nextStep(arg);
        }
      }).catch(async (e) => {
        await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'));
        log.error(logPrefix, 'create alert in DB crash', e);
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
      }).catch(async (e) => {
        await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'));
        log.error(logPrefix, 'attach message crash', e);
      });
    }
  })();
};
