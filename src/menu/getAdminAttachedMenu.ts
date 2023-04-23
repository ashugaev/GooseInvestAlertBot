import {Markup} from "telegraf"
import * as tt from "telegraf/typings/telegram-types"

import {createActionString} from "@/helpers"
import {Chat} from "@/models/Chat"

interface GetAdminAttachedMenuState {
    chats: Chat[],
    activeChatId: number | string,
}

export const getAdminAttachedMenu = ({chats, activeChatId}: GetAdminAttachedMenuState): tt.ExtraReplyMessage => {
    const chatButtons = chats.map(chat => {
        const isActivated = chat.id === activeChatId
        return Markup.callbackButton((isActivated ? '✅ ' : 'Switch to: ') + chat.title, createActionString('admin_chat', {
            id: chat.id
        }))
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

    const res = (
        Markup.keyboard([
            ...chatButtonsRows,
            [Markup.callbackButton("🏃🏽‍♂️Выйти из режима админа", "admin_exit")],
        ])
            .resize()
            .extra()
    )

    return res
}