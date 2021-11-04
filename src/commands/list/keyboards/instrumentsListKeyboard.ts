import { listConfig } from '../../../config'
import { Markup } from 'telegraf'
import { paginationButtons } from '../../../keyboards/paginationButtons'
import { createActionString } from '../../../helpers/createActionString'
import { Actions } from '../../../constants'
import { alertsTypeToggleButtons } from './alertsTypeToggleButtons'
import { EListTypes } from '../list.types'
import { getTimeShiftsCountForUser } from '../../../models'

/**
 * Вернет список кнопок для каждого инструмента по массиву данных
 */
export const instrumentsListKeyboard = async ({
  uniqTickersData,
  page,
  listType = EListTypes.levels,
  user = null
}) => {
  // Тикеры которые выведем на это странице
  const pageTickers = uniqTickersData.slice(page * listConfig.itemsPerPage, (page + 1) * listConfig.itemsPerPage)

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
    itemsLength: uniqTickersData.length,
    action: Actions.list_instrumentsPage,
    payload: {
      p: page
    }
  })

  getTickerButtons.push(paginatorButtons)

  const userShiftsCount = user ? await getTimeShiftsCountForUser(user) : 0

  if (userShiftsCount > 0) {
    getTickerButtons.push(alertsTypeToggleButtons({ listType }))
  }

  return Markup.inlineKeyboard(getTickerButtons)
}
