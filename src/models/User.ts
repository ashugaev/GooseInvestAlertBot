import { getModelForClass, prop } from '@typegoose/typegoose'
import { Context } from 'telegraf'

import { PremiumModel } from '@/models/Premium'
import { Limits } from '@/types/limits'

export class UserLimits {
  @prop({ required: false, default: Limits.priceLevels })
  priceLevels: number

  @prop({ required: false, default: Limits.shifts })
  shifts: number

  @prop({ required: false, default: Limits.volumes })
  volumes: number
}

export class User {
  @prop({ required: true, index: true, unique: false })
  id: number

  @prop({ required: true, unique: false, index: true })
  botId: number

  @prop({ required: true, default: 'ru' })
  language: string

  @prop({ required: false, _id: false })
  limits: UserLimits

  @prop({ required: true, default: false })
  adminMode: boolean

  @prop({ required: false, default: null })
  adminModeChatId: number

  // TODO: Save this value
  @prop({ required: false, default: null })
  username: string
}

// Get User model
export const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true },
})

// Get or create user
// FIXME: Делать одной операцией создание нового юзера через upsert
export async function findOrCreateUser(id: string | number, botId) {
  let user = await UserModel.findOne({ id }).lean()
  if (!user) {
    try {
      user = await new UserModel({
        id,
        adminMode: false,
        botId,
      }).save()

      // Grant 2weeks premium
      // KEEP ASYNC
      PremiumModel.create({
        userId: id,
        chatId: null,
        botId,
        isTrial: true,
        end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks
        start: new Date(),
      })
    } catch (err) {
      user = await UserModel.findOne({ id }).lean()
    }
  }
  return user
}

export const userObjToAdminMode = async (
  ctx: Context,
  chatId: number | string
) => {
  await UserModel.update(
    { id: ctx.from.id },
    { $set: { adminMode: true, adminModeChatId: chatId } }
  )
  ctx.dbuser = await UserModel.findOne({ id: ctx.from.id }).lean()
}

export const toUserMode = async (ctx: Context) => {
  await UserModel.update(
    { id: ctx.from.id },
    { $set: { adminMode: false, adminModeChatId: null } }
  )
  ctx.dbuser = await UserModel.findOne({ id: ctx.from.id }).lean()
}

export const grantPremium = async (id: number | string) => {
  await UserModel.update(
    { id },
    {
      $set: {
        limits: {
          priceLevels: 9999,
          shifts: 9999,
          volumes: 9999,
        },
      },
    }
  )
}
