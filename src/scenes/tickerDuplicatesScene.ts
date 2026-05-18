import { Markup as m } from 'telegraf'

import { createActionString } from '../helpers/createActionString'
import { getSourceMark } from '../helpers/getSourceMark'
import { i18n } from '../helpers/i18n'
import { COMMON_ACTIONS, COMMON_SCENES } from './scenes.constants'
import { waitButtonClickStep } from './wrappers'
import { immediateStep } from './wrappers/immediateStep'
const WizardScene = require('telegraf/scenes/wizard')

/**
 * Scenario for handling ticker duplicates.
 * Embedded into other scenarios.
 */

/**
 * Ask the user to pick a ticker
 */
const requestStep = immediateStep(
  'check-ticker-duplicates-send-message',
  async (ctx, state) => {
    const { instrumentsList } = state.payload

    if (!instrumentsList.length) {
      throw new Error('Not enough input data for tickerDuplicatesScene')
    }

    const keyboard = m.inlineKeyboard(
      instrumentsList.map((item) => [
        m.callbackButton(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `${item.name}${
            item.name !== item.ticker ? ` (${item.ticker})` : ''
          } ${getSourceMark(item, true, true)}`,
          createActionString(COMMON_ACTIONS.chooseTickerId, {
            id: item.id,
          })
        ),
      ])
    )

    await ctx.replyWithHTML(i18n.t('ru', 'alert_choose_between_duplicates'), {
      reply_markup: keyboard,
    })

    return ctx.wizard.next()
  }
)

const validateAndSaveStep = waitButtonClickStep(
  COMMON_ACTIONS.chooseTickerId,
  'shift_add_choose-timeframe',
  async (ctx, actionPayload, state) => {
    const { payload, callback } = state

    const { instrumentsList } = payload

    const { id } = actionPayload

    if (!id) {
      throw new Error('[CheckTickerDuplicates] Missing id in ticker selection')
    }

    const chosenInstrument = instrumentsList.find((el) => el.id === id)

    if (!chosenInstrument) {
      throw new Error('[CheckTickerDuplicates] Instrument selection failed')
    }

    callback({ instrumentsList: [chosenInstrument] })

    return ctx.scene.leave()
  }
)

export const tickerDuplicatesScene = new WizardScene(
  COMMON_SCENES.tickerDuplicates,
  requestStep,
  validateAndSaveStep
)
