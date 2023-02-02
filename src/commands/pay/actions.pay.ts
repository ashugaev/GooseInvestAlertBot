import { log } from '@helpers'
import { Context } from 'telegraf'

import { createCoinbaseInvoice } from '../../paymentApi/coinbase/createInvoice'
import { TARIFFS } from './pay.constants'

const LOG_PREFIX = '[PAY ACTION]'

export const generatePaymentLinkAction = async (ctx: Context) => {
  try {
    const {
      i, useId
    } = JSON.parse(ctx.match[1])

    const paymentData = TARIFFS[i]

    const invoiceData = await createCoinbaseInvoice({
      customerName: ctx.from.username,
      customerId: ctx.from.id,
      paymentDescription: paymentData.buttonText,
      amount: paymentData.price
    })

    await ctx.replyWithHTML(ctx.i18n.t('pay_link'),
      {
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{
            url: invoiceData.hosted_url,
            text: ctx.i18n.t('pay_link_button')
          }]]
        }
      }
    )
  } catch (e) {
    await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(LOG_PREFIX, e)
  }
}
