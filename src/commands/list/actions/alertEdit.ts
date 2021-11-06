import { listConfig } from '../../../config'
import { i18n } from '../../../helpers/i18n'
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency'
import { getInstrumentLink } from '../../../helpers/getInstrumentLInk'
import { alertEditKeyboard } from '../keyboards/alertEditKeyboard'
import { log } from '../../../helpers/log'

/**
 * Экшен перехода на страницу списка инструментов
 */
export const alertEdit = async (ctx) => {
  try {
    const {
      s: symbol,
      // Индекс алерта на текущей странице
      i,
      p: page
    } = JSON.parse(ctx.match[1])

    const alertsList = ctx.session.listCommand.alertsList

    // TODO: Копиипаст логики. Нужно сделать хелперы для вытаскивания данных из контекста
    const sortedInstrumentItems = alertsList
      .filter(item => item.symbol === symbol)
      .sort((a, b) => (a.lowerThen || a.greaterThen) - (b.lowerThen || b.greaterThen))

    const alert = sortedInstrumentItems[page * listConfig.itemsPerPage + i]

    const message = i18n.t('ru', 'alertsList_editOne', {
      name: alert.name,
      symbol: alert.symbol,
      growth: Boolean(alert.greaterThen),
      price: alert.lowerThen || alert.greaterThen,
      currency: symbolOrCurrency(alert.currency),
      link: alert.type && getInstrumentLink({ type: alert.type, ticker: alert.symbol, source: alert.source }),
      message: alert.message
    })

    // index of id
    const idI = alertsList.findIndex(el => el._id.toString() === alert._id.toString())

    const keyboard = alertEditKeyboard({ idI, symbol })

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: keyboard
      }
    }
    )
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
}
