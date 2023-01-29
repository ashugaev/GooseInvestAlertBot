import { immediateStep, waitMessageStep } from '@scenes'

import { getLastPrice } from '../../../helpers/getLastPrice'
import { getSourceMark } from '../../../helpers/getSourceMark'
import { i18n } from '../../../helpers/i18n'
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency'
import { ALERT_SCENES } from '../alert.constants'
import { validateAlertPrice } from '../validators'
const WizardScene = require('telegraf/scenes/wizard')

/**
 * Запрашивает у юзера цену
 *
 * В состоянии нужны параметры
 * - instrumentId
 */
const requestStep = immediateStep('ask-alert-price-request', async (ctx) => {
  const { state } = ctx.wizard
  const { instrumentsList } = state.payload

  const instrumentData = instrumentsList[0]
  const instrumentId = instrumentData.id

  const { currency, ticker, source } = instrumentData

  const price = await getLastPrice(instrumentId)

  state.price = price

  await ctx.replyWithHTML(
    i18n.t('ru', 'alert_add_choosePrice', {
      price,
      currency: symbolOrCurrency(currency),
      source: getSourceMark({ source, item: instrumentData })
    }),
    { disable_web_page_preview: true }
  )

  return ctx.wizard.next()
})

const validateAndSaveStep = waitMessageStep('ask-alert-price-validate-and-save', async (ctx, message, state) => {
  const {
    price: lastPrice,
    callback
  } = state

  const { normalized, isValid } = await validateAlertPrice({
    ctx,
    message,
    lastPrice
  })

  if (!isValid) {
    return ctx.wizard.selectStep(ctx.wizard.cursor)
  }

  callback({ prices: normalized, currentPrice: lastPrice })

  return ctx.scene.leave()
})

export const askAlertPriceScene = new WizardScene(ALERT_SCENES.askPrice,
  requestStep,
  validateAndSaveStep
)
