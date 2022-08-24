import { Middleware } from 'telegraf';

import { addAnalyticsToReply, chb_m } from './analytics';
import { i18n } from './i18n';
import { log } from './log';

export function sceneWrapper (intent: string, callback: (ctx: any) => Promise<void>, leaveOnFail?: boolean): Middleware<any> {
  return async (ctx) => {
    try {
      addAnalyticsToReply(ctx);
      chb_m({ ctx, intent });

      await callback(ctx);
    } catch (e) {
      log.error('Scene fail:', intent, e);
      await ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'));

      if (leaveOnFail) {
        return ctx.scene.leave();
      } else {
        return ctx.wizard.selectStep(ctx.wizard.cursor);
      }
    }
  };
}
