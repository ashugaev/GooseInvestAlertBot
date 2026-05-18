import { Markup } from 'telegraf'

import {
  REMOVE_ACTIONS,
  REMOVE_SCENE,
} from '@/commands/remove/remove.constants'
import { shiftsCache } from '@/cron/shiftsChecker'
import { createActionString } from '@/helpers'
import {
  PriceAlert,
  priceAlertCache,
  PriceAlertModel,
  TimeShift,
  TimeShiftModel,
} from '@/models'
import { immediateStep, waitButtonClickStep } from '@/scenes/wrappers'

import { i18n } from '../../helpers/i18n'

const WizardScene = require('telegraf/scenes/wizard')

/**
 * Handle: -
 * Ask: Alerts type
 * */
const chooseAlertsType = immediateStep(
  'choose alerts type',
  async (ctx, state) => {
    const { ticker } = state

    await ctx.replyWithHTML(
      i18n.t('ru', 'remove_chooseAlertsType', {
        ticker,
      }),
      {
        reply_markup: {
          inline_keyboard: [
            [
              // eslint-disable-next-line max-len
              Markup.callbackButton(
                i18n.t('ru', 'remove_chooseAlertsType_shift'),
                createActionString(REMOVE_ACTIONS.chooseSource, {
                  type: 'shift',
                })
              ),
            ],
            [
              // eslint-disable-next-line max-len
              Markup.callbackButton(
                i18n.t('ru', 'remove_chooseAlertsType_lvl'),
                createActionString(REMOVE_ACTIONS.chooseSource, { type: 'lvl' })
              ),
            ],
          ],
        },
      }
    )

    return ctx.wizard.next()
  }
)

/**
 * Handle: Result of the alerts-type selection
 * Final: Removal result
 */
const removeAlerts = waitButtonClickStep(
  REMOVE_ACTIONS.chooseSource,
  'shift_add_choose-source',
  async (ctx, actionsPayload, state = {}) => {
    const { type } = actionsPayload
    const { ticker } = state
    const { id: user } = ctx.from

    if (!user) {
      await ctx.replyWithHTML(i18n.t('ru', 'unrecognizedError'))
      return ctx.scene.leave()
    }

    let n = 0

    if (type === 'shift') {
      const params: Partial<TimeShift> = {
        botId: ctx.goose.id,
      }

      if (ticker) {
        params.ticker = ticker
      }

      // Chat
      if (ctx.dbuser.adminMode) {
        params.chat = ctx.adminChatActive.id
      }
      // User
      else {
        params.user = user
        params.chat = null
      }

      n = (await TimeShiftModel.deleteMany(params)).n
      shiftsCache.update()
    }

    if (type === 'lvl') {
      const params: Partial<PriceAlert> = {
        botId: ctx.goose.id,
        removed: false,
        triggered: false,
      }

      // Chat
      if (ctx.dbuser.adminMode) {
        params.chat = ctx.adminChatActive.id
      }
      // User
      else {
        params.user = user
        params.chat = null
      }

      if (ticker) {
        params.symbol = ticker
      }

      const res = await PriceAlertModel.updateMany(params, {
        $set: {
          removed: true,
        },
      })
      priceAlertCache.update()

      n = res?.nModified ?? 0
    }

    await ctx.replyWithHTML(
      i18n.t('ru', 'remove_chooseAlertsType_success', {
        n,
      })
    )

    return ctx.scene.leave()
  }
)

export const removeScenes = new WizardScene(
  REMOVE_SCENE,
  chooseAlertsType,
  removeAlerts
)
