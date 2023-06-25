import { Markup } from 'telegraf'
import * as tt from 'telegraf/typings/telegram-types'

import { createActionString } from '@/helpers'
import { Chat } from '@/models/Chat'

interface GetAdminAttachedMenuState {
  chats: Chat[]
  activeChatId: number | string
}

const adminOffBtn = Markup.callbackButton(
  '🏃🏽‍♂️Выйти из режима админа',
  'admin_exit'
)

export const getAdminOffButton = (): tt.ExtraReplyMessage => {
  return Markup.inlineKeyboard([[adminOffBtn]])
    .resize()
    .extra()
}

export const getAdminAttachedMenu = ({
  chats,
  activeChatId,
}: GetAdminAttachedMenuState): tt.ExtraReplyMessage => {
  const chatButtons = chats
    .filter((chat) => chat.isActive)
    .map((chat) => {
      const isActivated = chat.id === activeChatId
      return Markup.callbackButton(
        (isActivated ? '✅ Chat: ' : 'Chat: ') + chat.title,
        createActionString('admin_chat', {
          id: chat.id,
        })
      )
    })

  // split by two buttons in row
  const chatButtonsRows = chatButtons.reduce((acc, button, index) => {
    if (index % 2 === 0) {
      acc.push([button])
    } else {
      acc[acc.length - 1].push(button)
    }
    return acc
  }, [])

  const res = Markup.keyboard([...chatButtonsRows, [adminOffBtn]])
    .resize()
    .extra()

  return res
}
