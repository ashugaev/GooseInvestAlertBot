import { Context } from 'telegraf'

import { log } from '@/helpers'
import { PremiumPaymentRequestModel } from '@/models/PremiumPayment'
import { checkConibaseInvoice } from '@/paymentApi/coinbase/checkInvoice'

import { TARIFFS } from './pay.constants'

const LOG_PREFIX = '[PAY ACTION]'

const TRONSCAN_WALLET_ADDRESS = process.env.TRONSCAN_WALLET_ADDRESS

export const generatePaymentLinkAction = async (ctx: Context) => {
  try {
    const { i } = JSON.parse(ctx.match[1])

    const paymentData = TARIFFS[i]

    await ctx.replyWithHTML(
      ctx.i18n.t('pay_transfer', {
        amount: paymentData.price,
        address: TRONSCAN_WALLET_ADDRESS,
      })
    )

    const res = await PremiumPaymentRequestModel.create({
      userId: ctx.from.id,
      amount: paymentData.price,
      issueDate: new Date(),
      subscriptionType: paymentData.buttonText,
      monthsCount: paymentData.monthsCount,
      botId: ctx.goose.id,
      chatId: ctx.adminChatActive?.id,
    })

    // Cancel others
    await PremiumPaymentRequestModel.updateMany(
      {
        _id: { $ne: res._id },
        userId: ctx.from.id,
        paidDate: null,
        cancelDate: null,
      },
      {
        cancelDate: new Date(),
      }
    )
  } catch (e) {
    await ctx.replyWithHTML(ctx.i18n.t('unrecognizedError'))
    log.error(LOG_PREFIX, e)
  }
}

export const checkPaymentAction = async (ctx: Context) => {
  checkConibaseInvoice(ctx)
}
