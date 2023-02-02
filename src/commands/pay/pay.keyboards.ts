import { createActionString } from '@helpers'
import { Markup } from 'telegraf'

import { PAY_ACTIONS, TARIFFS } from './pay.constants'

export const payPricesKeyboard = [...TARIFFS.map((tariff, i) => ([
  Markup.callbackButton(
    tariff.buttonText,
    createActionString(PAY_ACTIONS.generatePaymentLink, { i })
  )
]))]
