import { PREMUIM_SCENES } from '@/commands/addPremium/addPremium.constants'
import { grantPremium, UserModel } from '@/models'
import { immediateStep, waitMessageStep } from '@/scenes'
const WizardScene = require('telegraf/scenes/wizard')

const premiumAddScene = immediateStep('premiumAddScene', async (ctx, state) => {
  await ctx.reply('Введи id пользователя')
  return ctx.wizard.next()
})

const premiumHandleIdScene = waitMessageStep(
  'premiumHandleIdScene',
  async (ctx, state) => {
    const id = ctx.message.text

    // Check if user exists
    const user = await UserModel.findOne({ id }).lean()

    if (!user) {
      await ctx.reply('Пользователь не найден')
      return ctx.scene.reenter()
    }

    await grantPremium(id)

    await ctx.reply('Пользователь получил премиум')

    return ctx.scene.leave()
  }
)

export const premiumScenes = new WizardScene(
  PREMUIM_SCENES.add,
  premiumAddScene,
  premiumHandleIdScene
)
