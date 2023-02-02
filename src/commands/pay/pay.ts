import { Context, Telegraf } from 'telegraf'

import { commandWrapper } from '../../helpers/commandWrapper'
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'
import { generatePaymentLinkAction } from './actions.pay'
import { PAY_ACTIONS } from './pay.constants'
import { payPricesKeyboard } from './pay.keyboards'

export function setupPay (bot: Telegraf<Context>) {
  bot.command(['pay', 'subscription'], commandWrapper(async ctx => {
    ctx.replyWithHTML(ctx.i18n.t('pay'),
      {
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: payPricesKeyboard
        }
      }
    )
  }))

  bot.action(triggerActionRegexp(PAY_ACTIONS.generatePaymentLink), generatePaymentLinkAction)
}
