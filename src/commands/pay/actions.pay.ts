import { Context } from 'telegraf'

import { log } from '@/helpers'
import { PremiumPaymentModel } from '@/models/PremiumPayment'
import { checkConibaseInvoice } from '@/paymentApi/coinbase/checkInvoice'

import { TARIFFS } from './pay.constants'

const LOG_PREFIX = '[PAY ACTION]'

export const generatePaymentLinkAction = async (ctx: Context) => {
  try {
    const { i } = JSON.parse(ctx.match[1])

    const paymentData = TARIFFS[i]

    // const invoiceData = await createCoinbaseInvoice({
    //   customerName: ctx.from.username,
    //   customerId: ctx.from.id.toString(),
    //   paymentDescription: paymentData.buttonText,
    //   amount: paymentData.price,
    // })

    // Платежка Coinbase
    // await ctx.replyWithHTML(ctx.i18n.t('pay_link'), {
    //   disable_web_page_preview: true,
    //   reply_markup: {
    //     inline_keyboard: [
    //       [
    //         {
    //           url: invoiceData.hosted_url,
    //           text: ctx.i18n.t('pay_link_button'),
    //         },
    //       ],
    //       [
    //         Markup.callbackButton(
    //           'Проверить оплату',
    //           createActionString(PAY_ACTIONS.checkPayment, {})
    //         ),
    //       ],
    //     ],
    //   },
    // })

    await ctx.replyWithHTML(
      ctx.i18n.t('pay_transfer', {
        amount: paymentData.price,
        address: process.env.BOSS_WALLET_ADDRESS,
      })
    )

    await PremiumPaymentModel.create({
      userId: ctx.from.id,
      amount: paymentData.price,
      // paymentId: invoiceData.id,
      issueDate: new Date(),
      subscriptionType: paymentData.buttonText,
      monthsCount: paymentData.monthsCount,
      botId: ctx.botInfo.id,
      chatId: ctx.adminChatActive?.id,
    })
  } catch (e) {
    await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(LOG_PREFIX, e)
  }
}

export const checkPaymentAction = async (ctx: Context) => {
  checkConibaseInvoice(ctx)
}
