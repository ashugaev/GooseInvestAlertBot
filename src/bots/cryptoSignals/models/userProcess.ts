import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class UserProcess {
  @prop({ required: true })
  userId: number

  @prop({ required: true })
  userHaveActiveAnalysis: boolean

  updatedAt: Date
}

export const UserProcessModel = getModelForClass(UserProcess)

export const startAnalysisForUser = async (userId: number) => {
  const processByUser = await UserProcessModel.findOne({
    userId,
  })

  if (!processByUser) {
    await UserProcessModel.create({
      userId,
      userHaveActiveAnalysis: true,
    })
  } else {
    processByUser.userHaveActiveAnalysis = true
    await processByUser.save()
  }
}

export const finishAnalysisForUser = async (userId: number) => {
  const processByUser = await UserProcessModel.findOne({
    userId,
  })

  if (!processByUser) {
    await UserProcessModel.create({
      userId,
      userHaveActiveAnalysis: false,
    })
  } else {
    processByUser.userHaveActiveAnalysis = false
    await processByUser.save()
  }
}
