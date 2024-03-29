import { Markup as m } from 'telegraf'

import { createActionString } from '../helpers/createActionString'
import { getSourceMark } from '../helpers/getSourceMark'
import { i18n } from '../helpers/i18n'
import { COMMON_ACTIONS, COMMON_SCENES } from './scenes.constants'
import { waitButtonClickStep } from './wrappers'
import { immediateStep } from './wrappers/immediateStep'
const WizardScene = require('telegraf/scenes/wizard')

/**
 * Это сценарий обработки дубликатов тикеров
 * Встраивается в вдругие сценарии
 */

/**
 * Просим выбрать тикер
 */
const requestStep = immediateStep('check-ticker-duplicates-send-message', async (ctx, state) => {
  const {
    instrumentsList
  } = state.payload

  if (!instrumentsList.length) {
    throw new Error('Недостаточно входных данных для tickerDuplicatesScene')
  }

  const keyboard = m.inlineKeyboard(instrumentsList.map(item => [m.callbackButton(
    `${item.name} (${item.ticker}) ${getSourceMark({ source: item.source })}`,
    createActionString(COMMON_ACTIONS.chooseTickerId, {
      id: item.id
    })
  )]))

  await ctx.replyWithHTML(i18n.t('ru', 'alert_choose_between_duplicates'), {
    reply_markup: keyboard
  })

  return ctx.wizard.next()
})

const validateAndSaveStep = waitButtonClickStep(
  COMMON_ACTIONS.chooseTickerId,
  'shift_add_choose-timeframe',
  async (ctx, actionPayload, state) => {
    const {
      payload,
      callback
    } = state

    const {
      instrumentsList
    } = payload

    const { id } = actionPayload

    if (!id) {
      throw new Error('[CheckTickerDuplicates] Нет id выборе тикера')
    }

    const chosenInstrument = instrumentsList.find(el => el.id === id)

    if (!chosenInstrument) {
      throw new Error('[CheckTickerDuplicates] Не сработал выбор инструмента')
    }

    callback({ instrumentsList: [chosenInstrument] })

    return ctx.scene.leave()
  })

export const tickerDuplicatesScene = new WizardScene(COMMON_SCENES.tickerDuplicates,
  requestStep,
  validateAndSaveStep
)
