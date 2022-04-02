import { listConfig } from '../../../config';
import { Actions } from '../../../constants';
import { getInstrumentLink } from '../../../helpers/getInstrumentLInk';
import { log } from '../../../helpers/log';
import { getLastPrice } from '../../../helpers/stocksApi';
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency';
import { PriceAlertItem } from '../../../models';
import { EKeyboardModes, instrumentPageKeyboard } from '../keyboards/instrumentPageKeyboard';
import { ListActionsDataKeys } from '../list.types';
import {shortenerCreateShort} from "@helpers";

interface IShowInstrumentPageParams {
  keyboardMode?: EKeyboardModes
  page: number
  ctx: any
  instrumentItems: PriceAlertItem[]
  edit?: boolean
  tickersPage?: number
}

export const getAlertNumberByPage = ({ i, page }) => {
  return i + 1 + (page * listConfig.itemsPerPage);
};

export const showInstrumentPage = async ({
  page,
  ctx,
  instrumentItems,
  edit,
  keyboardMode,
  tickersPage = 0
}: IShowInstrumentPageParams) => {
  // Получаем сортированный список инструментов для страницы
  // FIXME: Вынести
  const itemsToShow = instrumentItems
    .sort((a, b) => (a.lowerThen || a.greaterThen) - (b.lowerThen || b.greaterThen))
    .slice(page * listConfig.itemsPerPage, (page + 1) * listConfig.itemsPerPage);

  const itemsList = itemsToShow
    .map(({ symbol, message, lowerThen, greaterThen, currency, name }, i) => {
      const price = lowerThen ?? greaterThen;

      return ctx.i18n.t('alertList_item', {
        // Номер элемента с учетом страницы
        number: getAlertNumberByPage({ i, page }),
        price,
        message,
        currency: symbolOrCurrency(currency),
        growth: Boolean(greaterThen)
      });
    }).join('\n');

  const {
    type: instrumentType,
    name: instrumentName,
    currency: instrumentCurrency,
    source,
    tickerId,
    symbol,
    _id
  } = instrumentItems[0];

  let lastPrice;

  try {
    lastPrice = await getLastPrice({ id: tickerId });
  } catch (e) {
    log.error('ошибка получения цены', e);
  }

  const message = ctx.i18n.t('alertList_page', {
    link: instrumentType && getInstrumentLink({ type: instrumentType, ticker: symbol, source }),
    symbol,
    list: itemsList,
    name: instrumentName,
    currency: symbolOrCurrency(instrumentCurrency),
    price: lastPrice,
    showEditMessage: keyboardMode === EKeyboardModes.edit
  });

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
            [ListActionsDataKeys.selectedTickerIdShortened]: shortenerCreateShort(tickerId, ctx),
            p: page,
            kMode: keyboardMode,
            tp: tickersPage
          }
        },
        editNumberButtonsConfig: {
          action: Actions.list_editAlert,
          // payload: {
          //   [ListActionsDataKeys.selectedAlertId]: _id
          // }
          payloadCallback: (i) => {
            return {
              [ListActionsDataKeys.selectedAlertId]: itemsToShow[i]._id
            };
          }
        },
        editButtonConfig: {
          action: Actions.list_tickerPage,
          payload: {
            [ListActionsDataKeys.selectedTickerIdShortened]: shortenerCreateShort(tickerId, ctx)
          }
        }
      })
    }
  });
};
