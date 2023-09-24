import { showAlertEditPage } from '@/commands/list/utils/showAlertEditPage'
import { shortenerCreateShort } from '@/helpers'

import { listConfig } from '../../../config'
import { Actions } from '../../../constants'
import { getLastPrice } from '../../../helpers/getLastPrice'
import { getSourceMark } from '../../../helpers/getSourceMark'
import { getSymbolByTicker } from '../../../helpers/getSymbolByTicker'
import { log } from '../../../helpers/log'
import { getInstrumentByIdFromCache, PriceAlert } from '../../../models'
import {
  EKeyboardModes,
  instrumentPageKeyboard,
} from '../keyboards/instrumentPageKeyboard'
import { ListActionsDataKeys } from '../list.types'

interface IShowInstrumentPageParams {
  keyboardMode?: EKeyboardModes
  page: number
  ctx: any
  instrumentItems: PriceAlert[]
  /**
   * Send new keyboard or edit current
   */
  edit?: boolean
  tickersPage?: number
  noRedirectToEditPage?: boolean
}

export const getAlertNumberByPage = ({ i, page }) => {
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  return i + 1 + page * listConfig.itemsPerPage
}

export const showInstrumentPage = async ({
  page,
  ctx,
  instrumentItems,
  edit,
  keyboardMode,
  tickersPage = 0,
  noRedirectToEditPage = false,
}: IShowInstrumentPageParams) => {
  // If only one alert for instrument show this alert edit page
  if (instrumentItems.length === 1 && !noRedirectToEditPage) {
    return await showAlertEditPage({
      ctx,
      alert: instrumentItems[0],
      edit,
    })
  }

  // Получаем сортированный список инструментов для страницы
  // FIXME: Вынести
  const itemsToShow: PriceAlert[] = instrumentItems
    .sort(
      (a, b) => (a.lowerThen || a.greaterThen) - (b.lowerThen || b.greaterThen)
    )
    .slice(page * listConfig.itemsPerPage, (page + 1) * listConfig.itemsPerPage)

  const itemsList = itemsToShow
    .map(({ symbol, message, lowerThen, greaterThen, currency, name }, i) => {
      const price = lowerThen ?? greaterThen

      return ctx.i18n.t('alertList_item', {
        // Номер элемента с учетом страницы
        number: getAlertNumberByPage({ i, page }),
        price,
        message,
        currency: getSymbolByTicker(currency),
        growth: Boolean(greaterThen),
      })
    })
    .join('\n')

  const {
    name: instrumentName,
    currency: instrumentCurrency,
    tickerId,
    symbol,
  } = instrumentItems[0]

  let lastPrice

  const instrumentInfo = await getInstrumentByIdFromCache(tickerId)

  try {
    lastPrice = await getLastPrice(tickerId)
  } catch (e) {
    log.error('ошибка получения цены', e)
  }

  const message = ctx.i18n.t('alertList_page', {
    symbol,
    list: itemsList,
    name: instrumentName,
    currency: getSymbolByTicker(instrumentCurrency),
    price: lastPrice,
    showEditMessage: keyboardMode === EKeyboardModes.edit,
    source: getSourceMark(instrumentInfo),
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
        tickersPage,
        paginationButtonsConfig: {
          action: Actions.list_tickerPage,
          payload: {
            [ListActionsDataKeys.selectedTickerIdShortened]:
              shortenerCreateShort(tickerId),
            p: page,
            kMode: keyboardMode,
            tp: tickersPage,
          },
        },
        editNumberButtonsConfig: {
          action: Actions.list_editAlert,
          // payload: {
          //   [ListActionsDataKeys.selectedAlertId]: _id
          // }
          payloadCallback: (i) => {
            return {
              [ListActionsDataKeys.selectedAlertId]: shortenerCreateShort(
                itemsToShow[i]._id.toString()
              ),
            }
          },
        },
        editButtonConfig: {
          action: Actions.list_tickerPage,
          payload: {
            [ListActionsDataKeys.selectedTickerIdShortened]:
              shortenerCreateShort(tickerId),
          },
        },
      }),
    },
  })
}
