import axios from 'axios'
import { addMonths } from 'date-fns'
import { Context } from 'telegraf'

import { log } from '@/helpers'
import { PremiumModel } from '@/models/Premium'
import { PremiumPaymentRequestModel } from '@/models/PremiumPayment'
import { COINBASE_URL, CONIBASE_HEADERS } from '@/paymentApi/coinbase/index'

export const checkConibaseInvoice = async (ctx: Context) => {
  try {
    const chargesForUser = await PremiumPaymentRequestModel.find({
      userId: ctx.from.id,
      issueDate: { $gt: addMonths(new Date(), -1) },
    })

    let isTherePaidCharge = chargesForUser.some((charge) =>
      Boolean(charge.paidDate)
    )

    if (!isTherePaidCharge && chargesForUser.length > 0) {
      // Pull charge statuses from Coinbase and reconcile with our DB.
      for (const charge of chargesForUser) {
        const config = {
          method: 'get',
          url: `${COINBASE_URL}/charges/${charge.paymentId}`,
          headers: CONIBASE_HEADERS,
        }
        const res = await axios(config)

        const hasPayments = res.data.data.payments?.length > 0

        // hasPayments doesn't guarantee success — payment may have failed.
        if (hasPayments) {
          // Paid date can be based on payment status change or data from coinbase
          charge.paidDate = new Date()
          await charge.save()
          isTherePaidCharge = true

          const paidDate = new Date()
          const endDate = addMonths(paidDate, charge.monthsCount)

          await PremiumModel.create({
            userId: ctx.from.id,
            isTrial: false,
            end: endDate,
            start: paidDate,
          })

          break
        }
      }
    }

    if (isTherePaidCharge) {
      await ctx.replyWithHTML(ctx.i18n.t('pay_success'))
    } else {
      await ctx.replyWithHTML(ctx.i18n.t('pay_pending'))
    }
  } catch (error) {
    log.error('checkConibaseInvoice', error)
    await ctx.replyWithHTML(ctx.i18n.t('pay_error'))
  }
}
