import { Markup } from 'telegraf'

interface IPaginationButtonsParams {
    /**
     * Идентификатор экшена пагинации
     */
    name: string,
    page: number,
    itemsPerPage: number,
    itemsLength: number,
}

export const paginationButtons = ({ name, page, itemsPerPage, itemsLength }: IPaginationButtonsParams) => {
  const isFirstPage = page === 0
  const isLastPage = itemsLength / (page + 1) <= itemsPerPage

  const buttons = []

  !isFirstPage && (buttons.push(
    Markup.callbackButton(
      '⬅️',
            `${name}_page_${page - 1}`
    )
  ))

  !isLastPage && (buttons.push(
    Markup.callbackButton(
      '➡️',
            `${name}_page_${page + 1}`
    )
  ))

  return buttons
}
