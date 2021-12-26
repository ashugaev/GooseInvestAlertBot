import * as Composer from 'telegraf/composer';
import * as WizardScene from 'telegraf/scenes/wizard';

import { Scenes } from '../../../constants';
import { addAlert } from '../../../helpers/addAlert';
import { getInstrumentDataWithPrice } from '../../../helpers/getInstrumentData';
import { i18n } from '../../../helpers/i18n';
import { log } from '../../../helpers/log';
import { sceneWrapper } from '../../../helpers/sceneWrapper';
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency';

/**
 * Сцена сработает только на первое сообщение, которое явлется текстом и не командой
 */

const startAlertAddScene = sceneWrapper('add-start-scene', (ctx) => {
  ctx.replyWithHTML(i18n.t('ru', 'alert_add_chooseInstrument'));

  return ctx.wizard.next();
});

const addInstrumentNameStep = new Composer();

// Не начинается с /
addInstrumentNameStep.hears(/^(?!\/).+$/, sceneWrapper('add-choose-instrument', async (ctx) => {
  const { text: symbol } = ctx.message;

  try {
    const { instrumentData, price } = (await getInstrumentDataWithPrice({ symbol, ctx }))[0] ?? {};

    ctx.wizard.state.instrumentData = instrumentData;

    await ctx.replyWithHTML(i18n.t('ru', 'alert_add_choosePrice', {
      price,
      // @ts-expect-error
      currency: symbolOrCurrency(instrumentData.sourceSpecificData.currency)
    }));

    return ctx.wizard.next();
  } catch (e) {
    log.error(e);

    // Повторить текущий степ
    return ctx.wizard.selectStep(ctx.wizard.cursor);
  }
}));

// Если сообщение не то, что ожидаем - покидаем сцену
addInstrumentNameStep.on('message', (ctx, next) => {
  next();
  return ctx.scene.leave();
});

const addInstrumentPriceStep = new Composer();

// Не нечинается с '/'
addInstrumentPriceStep.hears(/^(?!\/).+$/, sceneWrapper('add-choose-price', async (ctx) => {
  const { text: price } = ctx.message;
  const { ticker: symbol } = ctx.wizard.state.instrumentData;
  let addedCount = null;

  try {
    const result = await addAlert({
      data: { symbol, price },
      ctx,
      startedFromScene: true
    });

    addedCount = result.addedCount;

    if (addedCount === 0) {
      throw new Error('Не добавлено ни одной цен');
    }

    ctx.wizard.state._id = result._id;
  } catch (e) {
    log.error(e);

    // Повторить текущий степ
    return ctx.wizard.selectStep(ctx.wizard.cursor);
  }

  if (addedCount === 1) {
    ctx.replyWithHTML(i18n.t('ru', 'alertCreatedAddMessage'));
    return ctx.wizard.next();
  } else {
    return ctx.scene.leave();
  }
}));

// Если сообщение не то, что ожидаем - покидаем сцену
addInstrumentPriceStep.on('message', (ctx, next) => {
  next();
  return ctx.scene.leave();
});

export const alertAddScene = new WizardScene(Scenes.alertAdd,
  startAlertAddScene,
  addInstrumentNameStep,
  addInstrumentPriceStep
  // addMessageStep
);
