import { MY_TOKEN_SCENE } from '@/commands/mytoken/mytoken.constants'
import { myTokenKeyboard } from '@/commands/mytoken/mytoken.keyboards'
import { deployBot, getBotByUserId } from '@/helpers/bot'
import { BotModel } from '@/models/Bot'
import { immediateStep, waitMessageStep } from '@/scenes/wrappers'

import { i18n } from '../../helpers/i18n'

const WizardScene = require('telegraf/scenes/wizard')

/**
 * Handle: -
 * Ask: Token
 * */
const sendToken = immediateStep('send token', async (ctx) => {
  const bot = await getBotByUserId(ctx.from.id)
  const botsInDb = await BotModel.find({ userId: ctx.from.id }).count()

  if (bot && botsInDb >= 1) {
    ctx.replyWithHTML(
      i18n.t('ru', 'mytoken_info', {
        bot: bot.context.goose.username,
      }),
      {
        reply_markup: myTokenKeyboard(bot.context.goose.id),
      }
    )
    return ctx.scene.leave()
  } else {
    await ctx.replyWithHTML(i18n.t('ru', 'mytoken_ask'))
    return ctx.wizard.next()
  }
})

/**
 * Handle: Token
 * Final: Validation result
 */
const deploy = waitMessageStep(
  'shift_add_choose-source',
  async (ctx, message, _state) => {
    const { id: _user } = ctx.from

    ctx.replyWithHTML(i18n.t('ru', 'mytoken_deploystart'))

    const { error, bot } = await deployBot(ctx, message)

    if (!error) {
      ctx.replyWithHTML(
        i18n.t('ru', 'mytoken_info', {
          bot: bot.context.goose.username,
        }),
        {
          reply_markup: myTokenKeyboard(bot.context.goose.id),
        }
      )
    } else {
      ctx.replyWithHTML(
        i18n.t('ru', 'mytoken_deployError', {
          error,
        })
      )
    }

    return ctx.scene.leave()
  }
)

export const myTokenScenes = new WizardScene(MY_TOKEN_SCENE, sendToken, deploy)
