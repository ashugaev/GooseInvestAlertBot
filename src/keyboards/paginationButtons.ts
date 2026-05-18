import { Markup } from 'telegraf'

import { listConfig } from '../config'
import { Actions } from '../constants'
import {
  createActionString,
  CreateActionStringPayload,
} from '../helpers/createActionString'

interface IPaginationPayload extends CreateActionStringPayload {
  /**
   * Current page
   */
  p: number
}

interface IPaginationButtonsParams {
  /**
   * Pagination action identifier
   */
  itemsPerPage?: number
  action: Actions
  itemsLength: number
  /**
   * Payload merged into the action
   */
  payload: IPaginationPayload
}

export const paginationButtons = ({
  itemsPerPage = listConfig.itemsPerPage,
  itemsLength,
  action,
  payload,
}: IPaginationButtonsParams) => {
  const page = payload.p

  const isFirstPage = page === 0
  const isLastPage = itemsLength / (page + 1) <= itemsPerPage

  const buttons = []

  !isFirstPage &&
    buttons.push(
      Markup.callbackButton(
        '⬅️',
        createActionString(action, {
          ...payload,
          p: page - 1,
        })
      )
    )

  !isLastPage &&
    buttons.push(
      Markup.callbackButton(
        '➡️',
        createActionString(action, {
          ...payload,
          p: page + 1,
        })
      )
    )

  return buttons
}
