import { Context,Telegraf } from 'telegraf'

import { commandWrapper } from '../helpers/commandWrapper'

export function setupHelp (bot: Telegraf<Context>) {
  bot.command(['help'], commandWrapper({availableForAdmins: false},async ctx => {
    ctx.replyWithHTML(ctx.i18n.t('help'),
      { disable_web_page_preview: true }
    )
  }))

  // Handle bot invite
  bot.on('new_chat_members', (ctx) => {
    ctx.replyWithHTML('Привет! Я бот для управления сменами и ценами в баре. Напиши /help для получения списка команд.')
  })

  // Handle bot kick from the chat
  bot.on('left_chat_member', (ctx) => {
    ctx.replyWithHTML('Привет! Я бот для управления сменами и ценами в баре. Напиши /help для получения списка команд.')
  })
}
