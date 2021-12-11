import { immediateStep, waitMessageStep } from '@helpers'
import * as WizardScene from 'telegraf/scenes/wizard'

import { i18n } from '../../../helpers/i18n'
import { log } from '../../../helpers/log'
import { getLastPriceById } from '../../../helpers/stocksApi'
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency'
import { getInstrumentDataById } from '../../../models'
import { ALERT_SCENES } from '../alert.constants'

/**
 * Запрашивает у юзера цену
 *
 * В состоняии нужны параметры
 * - id
 */
const priceRequestStep = immediateStep('ask-alert-price-request', async (ctx) => {
  try {
    const { state } = ctx.wizard
    const { instrumentId } = state

    const { source, currency } = await getInstrumentDataById(instrumentId)
    const price = await getLastPriceById(instrumentId, source)

    await ctx.replyWithHTML(i18n.t('ru', 'alert_add_choosePrice', {
      price,
      currency: symbolOrCurrency(currency)
    }))

    return ctx.wizard.next()
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }

  return ctx.wizard.next()
})

const priceValidateAndSaveStep = waitMessageStep('ask-alert-price-validate-and-save', (ctx) => {
  console.log('kek')
})

export const askAlertTickerScene = new WizardScene(ALERT_SCENES.askTicker,
  priceRequestStep,
  priceValidateAndSaveStep
)
