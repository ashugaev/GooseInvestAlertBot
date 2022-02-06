import { TelegrafContext } from 'telegraf/typings/context';

import { log } from './log';

const botToken = process.env.CHATBASE_ANALYTICS_TOKEN;

const chatbase = require('@google/chatbase');

export const getChb = (user: string) => chatbase
  .setApiKey(botToken)
  .setUserId(user)
  .setPlatform('any');

// generate initial chb instance
interface ChbMParams {
  intent?: string
  isBotResponse?: boolean
  ctx: TelegrafContext
  message?: string
}

// handle message
export const chb_m = ({
  intent,
  ctx,
  isBotResponse,
  message
}: ChbMParams): void => {
  try {
    const { id: user } = ctx.from;

    if (!message) {
      // TODO: Убрать это. Срабатывает и не отправляет статистику на экшенах.
      if (!ctx.message) return;

      message = ctx.message.text;
    }

    if (!intent) {
      const command = message.match(/^\/([a-z]+)(\s.*)?$/);

      if (command) {
        intent = command[1];
      } else {
        intent = 'unset';
      }
    }

    const chb = getChb(user.toString());

    if (isBotResponse) {
      chb.setAsTypeAgent();
    } else {
      chb.setAsTypeUser();
    }

    /* Chatbase is RIP
    chb
      .newMessage()
      .setMessage(message.slice(0, 150))
      .setIntent(intent)
      .send()
      .then((msg) => {
        log.info('сообщение отправлено в chatbase', msg);
      })
      .catch((err) => {
        log.error('Ошибка отправки сообщения в chatbase', err)
      })
     **/
  } catch (e) {
    log.error('Сломалась отправка статистики', e);
  }
};

export const addAnalyticsToReply = (ctx) => {
  const replyWithHTML = ctx.replyWithHTML;

  ctx.replyWithHTML = function (...args) {
    chb_m({ ctx, isBotResponse: true, message: args[0] });

    return replyWithHTML.apply(ctx, args);
  };
};
