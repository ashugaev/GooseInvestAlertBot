import {
  PREMIUM_ACTIONS,
  PREMUIM_SCENES,
} from '@/commands/addPremium/addPremium.constants'
import { grantPremium, UserModel } from '@/models'
import { immediateStep, waitMessageStep } from '@/scenes'
import { waitButtonClickStep } from '@/scenes/wrappers'
const WizardScene = require('telegraf/scenes/wizard')
import { set } from 'lodash'

import { createActionString } from '@/helpers'
import { plur } from '@/helpers/plural'

const premiumAddScene = immediateStep('premiumAddScene', async (ctx, state) => {
  await ctx.reply('Введи id пользователя')
  return ctx.wizard.next()
})

const premiumLengthScene = waitMessageStep(
  'premiumLengthScene',
  async (ctx, val, state) => {
    const id = ctx.message.text

    set(state, 'premium.userId', id)

    // Check if user exists
    const user = await UserModel.findOne({ id }).lean()

    if (!user) {
      await ctx.reply('Пользователь не найден')
      return ctx.scene.reenter()
    }

    await ctx.reply('Выбери длительность премиума', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Неделя',
              callback_data: createActionString(PREMIUM_ACTIONS.choosePeriod, {
                p: 7,
              }),
            },
          ],
          [
            {
              text: '2 недели',
              callback_data: createActionString(PREMIUM_ACTIONS.choosePeriod, {
                p: 14,
              }),
            },
          ],
          [
            {
              text: 'Месяц',
              callback_data: createActionString(PREMIUM_ACTIONS.choosePeriod, {
                p: 31,
              }),
            },
          ],
          [
            {
              text: '3 месяца',
              callback_data: createActionString(PREMIUM_ACTIONS.choosePeriod, {
                p: 93,
              }),
            },
          ],
          [
            {
              text: '6 месяцев',
              callback_data: createActionString(PREMIUM_ACTIONS.choosePeriod, {
                p: 186,
              }),
            },
          ],
          [
            {
              text: 'Год',
              callback_data: createActionString(PREMIUM_ACTIONS.choosePeriod, {
                p: 366,
              }),
            },
          ],
        ],
      },
    })

    return ctx.wizard.next()
  }
)

const premiumHandleIdScene = waitButtonClickStep(
  PREMIUM_ACTIONS.choosePeriod,
  'premiumHandleIdScene',
  async (ctx, actionPayload, state) => {
    const id = Number(state.premium.userId)
    const days = Number(actionPayload.p)

    await grantPremium(id, days, ctx.goose.id)

    await ctx.reply('Пользователь получил премиум')

    await ctx.telegram.sendMessage(
      id,
      `🎁 Вам выдан премиум на ${plur.days(days)}`,
      {
        reply_markup: { remove_keyboard: true },
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }
    )

    return ctx.scene.leave()
  }
)

export const premiumScenes = new WizardScene(
  PREMUIM_SCENES.add,
  premiumAddScene,
  premiumLengthScene,
  premiumHandleIdScene
)
