import { Context, Telegraf } from 'telegraf'

import { commandWrapper } from '../../helpers/commandWrapper'
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'
import { checkPaymentAction, generatePaymentLinkAction } from './actions.pay'
import { PAY_ACTIONS } from './pay.constants'
import { payPricesKeyboard } from './pay.keyboards'

const sendPayMessage = async (ctx: Context) => {
  ctx.replyWithHTML(ctx.i18n.t('pay'), {
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: payPricesKeyboard,
    },
  })
}

export function setupPay(bot: Telegraf<Context>) {
  bot.command(
    ['pay', 'subscription'],
    commandWrapper({ availableForAdmins: false }, async (ctx) => {
      await sendPayMessage(ctx)
    })
  )

  bot.action(triggerActionRegexp(PAY_ACTIONS.start), sendPayMessage)

  bot.action(
    triggerActionRegexp(PAY_ACTIONS.generatePaymentLink),
    generatePaymentLinkAction
  )

  bot.action(triggerActionRegexp(PAY_ACTIONS.checkPayment), checkPaymentAction)
}
