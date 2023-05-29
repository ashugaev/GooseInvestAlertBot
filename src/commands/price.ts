import { Context, Telegraf } from 'telegraf'

import { getLastPrice } from '@/helpers/getLastPrice'
import { getSourceMark } from '@/helpers/getSourceMark'
import { getInstrumentByTickerFromCache } from '@/models'

import { commandWrapper } from '../helpers/commandWrapper'
import { i18n } from '../helpers/i18n'

const logPrefix = '[price]'

export function setupPrice(bot: Telegraf<Context>) {
  bot.command(
    ['price'],
    commandWrapper({ availableForAdmins: false }, async (ctx) => {
      const data: string[] = ctx.message.text.match(
        /price ([a-zA-Zа-яА-ЯёЁ0-9_]+)$/
      )

      if (!data) {
        throw new Error(logPrefix + 'No data found')
      }

      const symbol = data[1].toUpperCase()
      const instrumentsList = await getInstrumentByTickerFromCache(symbol)

      if (!instrumentsList.length) {
        await ctx.replyWithHTML(
          i18n.t('ru', 'alertErrorUnexistedSymbol', { symbol }),
          { disable_web_page_preview: true }
        )
        return
      }

      const list = instrumentsList
        .map((item) =>
          ctx.i18n.t('price_row', {
            name: item.name,
            currency: item.currency,
            source: getSourceMark(item),
            symbol: item.ticker,
            price: getLastPrice(item.id, true),
          })
        )
        .join('')

      const templateData = {
        ticker: symbol,
        list,
      }

      ctx.replyWithHTML(ctx.i18n.t('price', templateData), {
        disable_web_page_preview: true,
      })
    })
  )
}
