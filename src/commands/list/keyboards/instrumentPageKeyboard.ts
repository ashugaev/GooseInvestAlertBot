import { Markup } from 'telegraf'
import { listConfig } from '../../../config'
import { paginationButtons } from '../../../keyboards/paginationButtons'
import { backButton } from '../../../keyboards/backButton'
import { i18n } from '../../../helpers/i18n'
import { Actions } from '../../../constants'
import { createActionString } from '../../../helpers/createActionString'

export enum EKeyboardModes {
    edit = 'e'
}

/**
 * Клавиши для страницы с алертами одного инструмента
 */
export const instrumentPageKeyboard = (ctx, { page, itemsLength, symbol, withoutBackButton, keyboardMode }) => {
  const keys = []

  // TODO: В пагинации передавать признак withoutBackButton в экшен
  // Получаю кнопки пагинации
  const paginatorButtons = paginationButtons({
    page,
    itemsPerPage: listConfig.itemsPerPage,
    itemsLength,
    name: symbol.toUpperCase()
  })

  keys.push(paginatorButtons)

  if (keyboardMode === EKeyboardModes.edit) {
    const editListButtons = Array.from(new Array(itemsLength)).map((_, i) => {
      const payload = {
        s: symbol.toUpperCase(),
        p: page,
        i
      }

      return (
        Markup.callbackButton(
          (++i).toString(),
          createActionString(Actions.list_editAlert, payload)
        )
      )
    })

    keys.push(editListButtons)
  } else {
    const payload = {
      p: 0,
      kMode: EKeyboardModes.edit,
      s: symbol.toUpperCase()
    }

    keys.push([Markup.callbackButton(
      i18n.t('ru', 'button_edit'),
      createActionString(Actions.list_tickerPage, payload)
    )])
  }

  const backButtonAction = keyboardMode === EKeyboardModes.edit ? createActionString(Actions.list_tickerPage, {
    p: page,
    s: symbol.toUpperCase()
  }
  ) : 'instrumentsList_page_0'

  !withoutBackButton && (keys.push([backButton({ action: backButtonAction })]))

  return Markup.inlineKeyboard(keys)
}
