import { Context, Telegraf } from 'telegraf';

import { commandWrapper } from '../helpers/commandWrapper';
import { getInstrumentDataWithPrice } from '../helpers/getInstrumentData';
import { i18n } from '../helpers/i18n';
import { log } from '../helpers/log';
import { symbolOrCurrency } from '../helpers/symbolOrCurrency';

export function setupPrice (bot: Telegraf<Context>) {
  bot.command(['price'], commandWrapper(async ctx => {
    const data: string[] = ctx.message.text.match(/price ([a-zA-Zа-яА-ЯёЁ0-9]+)$/);

    if (data) {
      const symbol = data[1];
      let instrumentData;
      let price;

      try {
        const data = (await getInstrumentDataWithPrice({ symbol }))[0];

        if (!data) {
          await ctx.replyWithHTML(
            i18n.t('ru', 'alertErrorUnexistedSymbol', { symbol }),
            { disable_web_page_preview: true }
          );
        };

        price = data.price;
        instrumentData = data.instrumentData;
      } catch (e) {
        await ctx.replyWithHTML(ctx.i18n.t('priceCheckError', { symbol }));

        log.error(e);

        return;
      }

      const { name, currency, ticker } = instrumentData;

      const templateData = {
        price,
        name,
        symbol: null,
        currency: null
      };

      if (currency) {
        templateData.currency = symbolOrCurrency(currency);
      }

      if (name.toUpperCase() !== ticker.toUpperCase()) {
        templateData.symbol = ticker;
      }

      ctx.replyWithHTML(ctx.i18n.t('price', templateData));

      return;
    }

    await ctx.replyWithHTML(ctx.i18n.t('priceInvalidFormat'));
  }));
}
