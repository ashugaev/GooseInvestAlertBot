import { Markup } from 'telegraf'
import { createActionString, CreateActionStringPayload } from '../helpers/createActionString'
import { listConfig } from '../config'
import { Actions } from '../constants'

interface IPaginationPayload extends CreateActionStringPayload{
  /**
   * Текущая страница
   */
  p: number
}

interface IPaginationButtonsParams {
  /**
    * Идентификатор экшена пагинации
    */
  itemsPerPage?: number
  action: Actions
  itemsLength: number
  /**
   * То что подсунем в экшен
   */
  payload: IPaginationPayload
}

export const paginationButtons = ({
  itemsPerPage = listConfig.itemsPerPage,
  itemsLength,
  action,
  payload
}: IPaginationButtonsParams) => {
  const page = payload.p

  const isFirstPage = page === 0
  const isLastPage = itemsLength / (page + 1) <= itemsPerPage

  const buttons = []

  !isFirstPage && (buttons.push(
    Markup.callbackButton(
      '⬅️',
      createActionString(action, {
        ...payload,
        p: page - 1
      })
    )
  ))

  !isLastPage && (buttons.push(
    Markup.callbackButton(
      '➡️',
      createActionString(action, {
        ...payload,
        p: page + 1
      })
    )
  ))

  return buttons
}
