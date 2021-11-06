import { listConfig } from '../../../config'
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency'
import { getLastPrice } from '../../../helpers/stocksApi'
import { log } from '../../../helpers/log'
import { getInstrumentLink } from '../../../helpers/getInstrumentLInk'
import { EKeyboardModes, instrumentPageKeyboard } from '../keyboards/instrumentPageKeyboard'
import { PriceAlertItem } from '../../../models'
import { Actions } from '../../../constants'

interface IShowInstrumentPageParams {
  keyboardMode?: EKeyboardModes
  page: number
  ctx: any
  instrumentItems: PriceAlertItem[]
  symbol: string
  edit?: boolean
}

export const getAlertNumberByPage = ({ i, page }) => {
  return i + 1 + (page * listConfig.itemsPerPage)
}

export const showInstrumentPage = async ({
  page, ctx, instrumentItems, symbol, edit, keyboardMode
}: IShowInstrumentPageParams) => {
  const itemsToShow = instrumentItems
    .sort((a, b) => (a.lowerThen || a.greaterThen) - (b.lowerThen || b.greaterThen))
    .slice(page * listConfig.itemsPerPage, (page + 1) * listConfig.itemsPerPage)

  const itemsList = itemsToShow
  // Сортировка по цене
    .map(({ symbol, message, lowerThen, greaterThen, currency, name }, i) => {
      const price = lowerThen || greaterThen

      return ctx.i18n.t('alertList_item', {
        // Номер элемента с учетом страницы
        number: getAlertNumberByPage({ i, page }),
        price,
        message,
        currency: symbolOrCurrency(currency),
        growth: Boolean(greaterThen)
      })
    }).join('\n')

  const { type: instrumentType, name: instrumentName, currency: instrumentCurrency, source } = instrumentItems[0]

  let lastPrice

  try {
    lastPrice = await getLastPrice({ ticker: symbol })
  } catch (e) {
    log.error('ошибка получения цены', e)
  }

  const message = ctx.i18n.t('alertList_page', {
    link: instrumentType && getInstrumentLink({ type: instrumentType, ticker: symbol, source }),
    symbol,
    list: itemsList,
    name: instrumentName,
    currency: symbolOrCurrency(instrumentCurrency),
    price: lastPrice,
    showEditMessage: keyboardMode === EKeyboardModes.edit
  })

  await ctx[edit ? 'editMessageText' : 'replyWithHTML'](message, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      ...instrumentPageKeyboard(ctx, {
        page,
        itemsLength: instrumentItems.length,
        itemsToShowLength: itemsToShow.length,
        symbol,
        withoutBackButton: false,
        keyboardMode,
        paginationButtonsConfig: {
          action: Actions.list_tickerPage,
          payload: {
            s: symbol,
            p: page,
            kMode: keyboardMode
          }
        },
        editNumberButtonsConfig: {
          action: Actions.list_editAlert,
          payload: {
            s: symbol.toUpperCase()
          }
        },
        editButtonConfig: {
          action: Actions.list_tickerPage,
          payload: {
            s: symbol.toUpperCase()
          }
        }
      })
    }
  })
}
