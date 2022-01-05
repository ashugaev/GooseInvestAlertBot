import { Middleware } from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';

import { log } from './log';

export function commandWrapper (callback: (ctx: any) => Promise<void>): Middleware<TelegrafContext> {
  return async (ctx) => {
    try {
      await callback(ctx);
    } catch (e) {
      await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'));
      log.error(e);
    }
  };
}
