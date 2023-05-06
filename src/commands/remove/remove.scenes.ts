
import { Markup } from 'telegraf'

import { REMOVE_ACTIONS, REMOVE_SCENE } from '@/commands/remove/remove.constants'
import { createActionString } from '@/helpers'
import { PriceAlertModel, TimeShiftModel } from '@/models'
import { immediateStep, waitButtonClickStep } from '@/scenes/wrappers'

import { i18n } from '../../helpers/i18n'

const WizardScene = require('telegraf/scenes/wizard')

/**
 * Handle: -
 * Ask: Alerts type
 * */
const chooseAlertsType = immediateStep('choose alerts type', async (ctx) => {
  await ctx.replyWithHTML(i18n.t('ru', 'remove_chooseAlertsType'), {
    reply_markup: {
      inline_keyboard: [
        [
          // eslint-disable-next-line max-len
          Markup.callbackButton(i18n.t('ru', 'remove_chooseAlertsType_shift'), createActionString(REMOVE_ACTIONS.chooseSource, { type: 'shift' }))
        ], [
          // eslint-disable-next-line max-len
          Markup.callbackButton(i18n.t('ru', 'remove_chooseAlertsType_lvl'), createActionString(REMOVE_ACTIONS.chooseSource, { type: 'lvl' }))
        ]
      ]
    }
  })

  return ctx.wizard.next()
})

/**
 * Handle: Результат выбора типа алертов
 * Final: Результат удаления
 */
const removeAlerts = waitButtonClickStep(
  REMOVE_ACTIONS.chooseSource,
  'shift_add_choose-source',
  async (ctx, actionsPayload, state) => {
    const { type } = actionsPayload
    const { id: user } = ctx.from

    if (!user) {
      await ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
      return ctx.scene.leave()
    }

    let n = 0

    if (type === 'shift') {
      // FIXME: Support chat
      n = (await TimeShiftModel.deleteMany({ user, chat: null })).n
    }

    if (type === 'lvl') {
      n = (await PriceAlertModel.deleteMany({ user, chat: null })).n
    }

    await ctx.replyWithHTML(i18n.t('ru', 'remove_chooseAlertsType_success', {
      n
    }))

    return ctx.scene.leave()
  })

export const removeScenes = new WizardScene(REMOVE_SCENE,
  chooseAlertsType,
  removeAlerts
)
