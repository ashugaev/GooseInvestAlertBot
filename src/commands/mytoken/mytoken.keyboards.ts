import { Markup } from 'telegraf'

import { MY_TOKEN_ACTIONS } from '@/commands/mytoken/mytoken.constants'
import { createActionString } from '@/helpers'
import { i18n } from '@/helpers/i18n'

export const myTokenKeyboard = (botId: number) => {
  const btnRemove = Markup.callbackButton(
    i18n.t('ru', 'mytoken_removeBtn'),
    createActionString(MY_TOKEN_ACTIONS.remove, { botId })
  )

  return Markup.inlineKeyboard([btnRemove])
}
