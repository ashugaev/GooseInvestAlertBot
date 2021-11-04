import { Markup } from 'telegraf'
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
// TODO: В пагинации передавать признак withoutBackButton в экшен
export const instrumentPageKeyboard = (ctx, { page, itemsLength, symbol, withoutBackButton, keyboardMode }) => {
  const keys = []

  const isEditMode = keyboardMode === EKeyboardModes.edit

  // Получаю кнопки пагинации (стрелки)
  const paginatorButtons = paginationButtons({
    itemsLength,
    action: Actions.list_tickerPage,
    payload: {
      s: symbol,
      p: page,
      kMode: keyboardMode
    }
  })

  // Добавляем стрелки
  keys.push(paginatorButtons)

  if (isEditMode) {
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

    // Цифры редактирования алерта
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

  const backButtonAction = isEditMode
    ? createActionString(Actions.list_tickerPage, {
        p: page,
        s: symbol.toUpperCase()
      })
    : createActionString(Actions.list_instrumentsPage, {})

  !withoutBackButton && (keys.push([backButton({ action: backButtonAction })]))

  return Markup.inlineKeyboard(keys)
}
