import { immediateStep, waitMessageStep } from '@helpers'
import * as WizardScene from 'telegraf/scenes/wizard'

import { getPricesFromString } from '../../../helpers/getPricesFromString'
import { i18n } from '../../../helpers/i18n'
import { log } from '../../../helpers/log'
import { getLastPriceById } from '../../../helpers/stocksApi'
import { symbolOrCurrency } from '../../../helpers/symbolOrCurrency'
import { getInstrumentDataById } from '../../../models'
import { ALERT_SCENES } from '../alert.constants'
import { addAlert } from '../utils/addAlert'

const { set, get } = require('lodash')

/**
 * Запрашивает у юзера цену
 *
 * В состоянии нужны параметры
 * - instrumentId
 */
const priceRequestStep = immediateStep('ask-alert-price-request', async (ctx) => {
  try {
    const { state } = ctx.wizard
    const { instrumentId } = state.payload

    const instrumentData = await getInstrumentDataById(instrumentId)

    const { source, currency } = instrumentData

    const price = await getLastPriceById(instrumentId, source)

    state.price = price

    await ctx.replyWithHTML(i18n.t('ru', 'alert_add_choosePrice', {
      price,
      currency: symbolOrCurrency(currency)
    }))

    return ctx.wizard.next()
  } catch (e) {
    ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(e)
  }
})

const priceValidateAndSaveStep = waitMessageStep('ask-alert-price-validate-and-save', (ctx) => {
  try {
    const { state } = ctx.wizard
    const {
      price: lastPrice,
      payload,
      callback
    } = state

    const { text: pricesString } = ctx.message

    const { prices, invalidValues } = getPricesFromString({
      string: pricesString,
      lastPrice
    })

    if (invalidValues.length) {
      const invalidPricesString = invalidValues.join(' ,')

      ctx.replyWithHTML(i18n.t('ru', 'alert_add_choosePrice_invalid', {
        invalid: invalidPricesString
      }))

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    if (!invalidValues.length && !prices.length) {
      ctx.replyWithHTML(i18n.t('ru', 'alert_add_choosePrice_invalid'))

      return ctx.wizard.selectStep(ctx.wizard.cursor)
    }

    // Добавим к payload цены (prices)
    callback(ctx, { ...payload, prices })

    return ctx.scene.leave()
  } catch (e) {
    log.error(e)

    return ctx.wizard.selectStep(ctx.wizard.cursor)
  }
})

export const askAlertPriceScene = new WizardScene(ALERT_SCENES.askPrice,
  priceRequestStep,
  priceValidateAndSaveStep
)
