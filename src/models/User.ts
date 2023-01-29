import { prop, getModelForClass } from '@typegoose/typegoose'

export class UserLimits {
  @prop({ required: false })
  priceLevels: number

  @prop({ required: false })
  shifts: number
}

export class User {
  @prop({ required: true, index: true, unique: true })
  id: number | number

  @prop({ required: true, default: 'ru' })
  language: string

  @prop({ required: false })
  limits: UserLimits
}

// Get User model
const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true }
})

// Get or create user
export async function findUser (id: string | number) {
  let user = await UserModel.findOne({ id }).lean()
  if (!user) {
    try {
      user = await new UserModel({ id }).save()
    } catch (err) {
      user = await UserModel.findOne({ id }).lean()
    }
  }
  return user
}
