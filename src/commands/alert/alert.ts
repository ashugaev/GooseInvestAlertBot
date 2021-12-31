import { Context, Telegraf } from 'telegraf';

import { commandWrapper } from '../../helpers/commandWrapper';
import { i18n } from '../../helpers/i18n';
import { log } from '../../helpers/log';
import { getAlertsCountForUser, removePriceAlert } from '../../models';
import { addAlertScenario } from './scenarios/addAlertScenario';

export function setupAlert (bot: Telegraf<Context>) {
  const callback = commandWrapper(async (ctx) => {
    const { text } = ctx.message;
    const { id: user } = ctx.from;

    const alertsLimit = ctx.userLimits.priceLevels;
    const userAlertsCount = await getAlertsCountForUser(user);

    if (userAlertsCount >= alertsLimit) {
      await ctx.replyWithHTML(ctx.i18n.t('alerts_overlimit', { limit: alertsLimit }));
      return;
    }

    // Сценарий добавления
    let data = text.match(/^\/(alert|add)$/);

    if (data) {
      addAlertScenario(ctx, {});
      return;
    }

    // Добавление одной командой
    data = text.match(/^\/(alert|add) ([a-zA-Zа-яА-ЯёЁ0-9]+) ([\d.\s\-+%]+)$/);

    if (data) {
      await addAlertScenario(ctx, {
        ticker: data[2],
        prices: data[3]
      });

      return;
    }

    // Добавление неполной командой
    data = text.match(/^\/(alert|add) ([a-zA-Zа-яА-ЯёЁ0-9]+)$/);

    if (data) {
      await addAlertScenario(ctx,
        {
          ticker: data[2].toUpperCase()
        });

      return;
    }

    // Удаление алертов по инструменту
    data = text.match(/^\/alert remove ([a-zA-Zа-яА-ЯёЁ0-9]+)$/);

    if (data) {
      const symbol = data[1].toUpperCase();

      await removePriceAlertAndSendMessage({ symbol, user, ctx });

      return;
    }

    // Invalid Format
    ctx.replyWithHTML(ctx.i18n.t('alertErrorInvalidFormat'));
  });

  bot.command(['alert', 'add'], callback);
  bot.hears(i18n.t('ru', 'alert_button'), callback);

  function removePriceAlertAndSendMessage ({ user, symbol, ctx }) {
    return new Promise(async (rs, rj) => {
      try {
        const deletedCount = await removePriceAlert({ symbol, user });

        if (deletedCount) {
          ctx.replyWithHTML(ctx.i18n.t('alertRemovedBySymbol', { symbol: symbol.toUpperCase() }));
        } else {
          ctx.replyWithHTML(ctx.i18n.t('alertRemovedBySymbolNothingDeleted', { symbol: symbol.toUpperCase() }));
        }

        log.info('Удалены алерты для', symbol, user);

        rs();
      } catch (e) {
        await ctx.replyWithHTML(ctx.i18n.t('alertRemoveError'));
        rj(e);
      }
    });
  }
}
