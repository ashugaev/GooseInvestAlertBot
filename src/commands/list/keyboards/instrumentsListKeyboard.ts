import { listConfig } from '../../../config'
import { Markup } from 'telegraf'
import { paginationButtons } from '../../../keyboards/paginationButtons'
import { createActionString } from '../../../helpers/createActionString'
import { Actions } from '../../../constants'

/**
 * Вернет список кнопок для каждого инструмента по массиву данных
 */
export const instrumentsListKeyboard = ({ uniqTickersData, page }) => {
  // Тикеры которые выведем на это странице
  const pageTickers = uniqTickersData.slice(page * listConfig.itemsPerPage, (page + 1) * listConfig.itemsPerPage)

  const showInstrumentActionPayload = {}

  // Генерит инлайн кнопки по тикерам
  const getTickerButtons = pageTickers.map(({ name, symbol }) => {
    const payload = {
      s: symbol.toUpperCase(),
      p: 0
    }

    return ([
      Markup.callbackButton(
                `${name} (${symbol})`,
                createActionString(Actions.list_tickerPage, payload)
      )
    ])
  })

  // Получаю кнопки пагинации
  const paginatorButtons = paginationButtons({
    page,
    itemsPerPage: listConfig.itemsPerPage,
    itemsLength: uniqTickersData.length,
    name: 'instrumentsList'
  })

  getTickerButtons.push(paginatorButtons)

  return Markup.inlineKeyboard(getTickerButtons)
}
