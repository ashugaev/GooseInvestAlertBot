import {getModelForClass, prop} from '@typegoose/typegoose'
import {Context} from "telegraf"

import {Limits} from "@/types/limits"

export class UserLimits {
    @prop({required: false, default: Limits.priceLevels})
      priceLevels: number

    @prop({required: false, default: Limits.shifts})
      shifts: number
}

export class User {
    @prop({required: true, index: true, unique: true})
      id: number

    @prop({required: true, default: 'ru'})
      language: string

    @prop({required: false, _id: false})
      limits: UserLimits

    @prop({required: true, default: false})
      adminMode: boolean

    @prop({required: false, default: null})
      adminModeChatId: number
}

// Get User model
const UserModel = getModelForClass(User, {
  schemaOptions: {timestamps: true}
})

// Get or create user
export async function findUser(id: string | number) {
  let user = await UserModel.findOne({id}).lean()
  if (!user) {
    try {
      user = await new UserModel({id}).save()
    } catch (err) {
      user = await UserModel.findOne({id}).lean()
    }
  }
  return user
}

export const userObjToAdminMode = async (ctx: Context, chatId: number | string) => {
  await UserModel.update({id: ctx.from.id}, {$set: {adminMode: true, adminModeChatId: chatId}})
  ctx.dbuser = await UserModel.findOne({id: ctx.from.id}).lean()
}

export const toUserMode = async (ctx: Context) => {
  await UserModel.update({id: ctx.from.id}, {$set: {adminMode: false, adminModeChatId: null}})
  ctx.dbuser = await UserModel.findOne({id: ctx.from.id}).lean()
}