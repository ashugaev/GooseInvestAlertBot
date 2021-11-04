import { Markup } from 'telegraf'

interface IBackButtonParams {
  action: string
}

export const backButton = ({ action }: IBackButtonParams) => {
  return Markup.callbackButton(
    '⏎ Назад',
    action
  )
}
