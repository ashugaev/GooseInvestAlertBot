import {Middleware} from 'telegraf'
import {TelegrafContext} from 'telegraf/typings/context'
import * as tt from "telegraf/typings/telegram-types"
import I18N from 'telegraf-i18n'

import {UserLimits} from "@/models"

import {ListCommandState} from '../commands/list/list.types'
import {User} from '../models'

interface CommandsState {
    listCommand: ListCommandState
}

declare module 'telegraf' {
    export class Context {
        i18n: I18N
        session: CommandsState
        /**
         * Bot info
         */
        goose: tt.User
        /**
         * User info
         */
        dbuser: User
        /**
         * Chat info
         */
        dbchat: Chat
        /**
         * Is group chat
         */
        isGroup: boolean
        /**
         * is private chat
         */
        isPrivate: boolean
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
    }

    export interface Composer<TContext extends Context> {
        action(
            action: string | string[] | RegExp,
            middleware: Middleware<TelegrafContext>,
            ...middlewares: Array<Middleware<TelegrafContext>>
        ): Composer<TContext>
    }
}
