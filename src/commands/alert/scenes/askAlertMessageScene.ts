import { waitMessageStep } from '@scenes';
import * as WizardScene from 'telegraf/scenes/wizard';

import { i18n } from '../../../helpers/i18n';
import { sceneWrapper } from '../../../helpers/sceneWrapper';
import { updateAlert } from '../../../models';
import { ALERT_SCENES } from '../alert.constants';

/**
 * Запрашивает у юзера информационное сообщение для алерта
 */
const requestStep = sceneWrapper('ask-alert-message-request', async (ctx) => {
  ctx.replyWithHTML(i18n.t('ru', 'alertCreatedAddMessage'));

  return ctx.wizard.next();
});

/**
 * Апдейтит сообщение в алерте.
 *
 * TODO: Вообще конечно убрать бы выполнение апдейта и оставить тут только сбор данных.
 */
const validateAndSaveStep = waitMessageStep('ask-alert-message-validate-and-save', async (ctx, message, state) => {
  const {
    payload
  } = state;

  const {
    createdItemsList
  } = payload;

  if (createdItemsList.length !== 1) {
    throw new Error('Нельзя прикрепить сообщение к нескольким алертам');
  }

  if (!message.length) {
    throw new Error('Пустое сообщение');
  }

  const createdItem = createdItemsList[0];

  const { _id } = createdItem;

  const result = await updateAlert({
    _id,
    data: {
      message
    }
  });

  if (result.nModified) {
    ctx.replyWithHTML(i18n.t('ru', 'alertMessageUpdated'));
  } else {
    ctx.replyWithHTML(i18n.t('ru', 'alertMessageUpdateError'));
  }

  return ctx.scene.leave();
});

export const askAlertMessageScene = new WizardScene(ALERT_SCENES.askMessage,
  requestStep,
  validateAndSaveStep
);
