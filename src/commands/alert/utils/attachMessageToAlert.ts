/**
 * Добавит сообщение к алерту по _id
 */
import { i18n } from '../../../helpers/i18n';
import { updateAlert } from '../../../models';

export const attachMessageToAlert = async (ctx, { _id, message }, callback) => {
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

  callback({});
};
