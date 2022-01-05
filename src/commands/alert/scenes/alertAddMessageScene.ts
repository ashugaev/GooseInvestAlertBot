/**
 * Нужен только для addAlert, который используется в добавлении алерта одной командой. Со временем удалится.
 *
 * @deprecated Использовать askAlertMessageScene
 */

import * as Composer from 'telegraf/composer';
import * as WizardScene from 'telegraf/scenes/wizard';

import { Scenes } from '../../../constants';
import { i18n } from '../../../helpers/i18n';
import { log } from '../../../helpers/log';
import { sceneWrapper } from '../../../helpers/sceneWrapper';
import { updateAlert } from '../../../models';

const startAddMessageScene = sceneWrapper('add-set-comment-start-scene', (ctx) => {
  ctx.replyWithHTML(i18n.t('ru', 'alertCreatedAddMessage'));
  return ctx.wizard.next();
});

export const addMessageStep = new Composer();

// Не начинается с /
addMessageStep.hears(/^(?!\/).+$/, sceneWrapper('add-set-comment', async (ctx) => {
  const { text } = ctx.message;
  const { _id } = ctx.wizard.state;

  try {
    const result = await updateAlert({
      _id,
      data: {
        message: text
      }
    });

    if (result.nModified) {
      ctx.replyWithHTML(i18n.t('ru', 'alertMessageUpdated'));
    } else {
      ctx.replyWithHTML(i18n.t('ru', 'alertMessageUpdateError'));
    }
  } catch (e) {
    ctx.replyWithHTML(i18n.t('ru', 'alertMessageUpdateError'));

    log.error(e);
  }

  return ctx.scene.leave();
}));

addMessageStep.on('message', (ctx, next) => {
  next();
  return ctx.scene.leave();
});

export const alertAddMessageScene = new WizardScene(Scenes.alertMessage,
  startAddMessageScene,
  addMessageStep
);
