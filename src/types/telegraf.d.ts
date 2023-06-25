import { Middleware } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import * as tt from 'telegraf/typings/telegram-types'
import I18N from 'telegraf-i18n'

import { User, UserLimits } from '@/models'
import { Chat } from '@/models/Chat'

import { ListCommandState } from '../commands/list/list.types'

interface CommandsState {
  listCommand: ListCommandState
}

declare module 'telegraf' {
  export class Update extends tt.Update {
    chat: tt.Chat
    from: tt.User
    date: number
    my_chat_member?: tt.ChatMember
    old_chat_mamber?: tt.ChatMember
    new_chat_member?: tt.ChatMember
    invite_link: tt.ChatInviteLink
    via_chat_folder_invite_link: boolean
  }

  export class Context {
    update: Update
    i18n: I18N
    session: tt.CommandsState
    /**
     * Bot info
     */
    goose: tt.User
    /**
     * User info
     */
    dbuser?: User
    /**
     * Limits object
     */
    limits: UserLimits
    /**
     * Chats awailable for admins
     */
    adminChats: Chat[]
    /**
     * Selected chat in admin mode
     */
    adminChatActive: Chat
    /**
     * Used who deployed this bot
     */
    promotedByUerId
  }

  export interface Composer<TContext extends Context> {
    action(
      action: string | string[] | RegExp,
      middleware: Middleware<TelegrafContext>,
      ...middlewares: Array<Middleware<TelegrafContext>>
    ): Composer<TContext>
  }
}
