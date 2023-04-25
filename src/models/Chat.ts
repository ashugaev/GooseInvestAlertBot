import {getModelForClass, prop} from '@typegoose/typegoose'
import * as tt from "telegraf/typings/telegram-types"
import {ChatType} from "telegraf/typings/telegram-types"


export class Chat {
    @prop({required: true, index: true, unique: true})
      id: number | string
    
    @prop({required: true})
      type: ChatType

    @prop({required: true})
      title: string

    @prop({required: true})
      isActive: boolean

    @prop({items: Number, required: true})
      admins: number[]
}

export const ChatModel = getModelForClass(Chat, {
  schemaOptions: {timestamps: true},
})

// Called on bot adding to chat
export async function createChat({id, title, type}: tt.Chat, admins: tt.ChatMember[]) {
  const nonBotAdmins: number[] = admins.filter((admin) => !admin.user.is_bot).map((admin) => admin.user.id)

  const data: Chat = {
    id,
    title,
    // @ts-ignore
    type,
    // @ts-ignore
    admins: nonBotAdmins,
    isActive: true,
  }

  await ChatModel.insertMany([data])
}

// Called on bot adding to chat
export async function createOrUpdateChat({id, title, type}: tt.Chat, admins: tt.ChatMember[]) {
  const nonBotAdmins: number[] = admins.filter((admin) => !admin.user.is_bot).map((admin) => admin.user.id)

  const data: Chat = {
    id,
    title,
    // @ts-ignore
    type,
    isActive: true,
    admins: nonBotAdmins
  }

  await ChatModel.updateOne({id}, {$set: data}, {upsert: true})
}

export const deactivateChat = async (chat: tt.Chat) => {
  await ChatModel.updateOne({id: chat.id}, {isActive: false})
}

export const updateChatTitle = async (chat: tt.Chat) => {
  await ChatModel.updateOne({id: chat.id}, {title: chat.title})
}

export const getUserChats = async (userId: number | string): Promise<Chat[]> => {
  // @ts-ignore
  return await ChatModel.find({
    admins: {
      $in: [userId]
    }
  }).lean()
}