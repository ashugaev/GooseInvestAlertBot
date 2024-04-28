import axios from 'axios'
import { addMonths } from 'date-fns'
import { Context } from 'telegraf'

import { log } from '@/helpers'
import { PremiumModel } from '@/models/Premium'
import { PremiumPaymentModel } from '@/models/PremiumPayment'
import { COINBASE_URL, CONIBASE_HEADERS } from '@/paymentApi/coinbase/index'

export const checkConibaseInvoice = async (ctx: Context) => {
  try {
    const chargesForUser = await PremiumPaymentModel.find({
      userId: ctx.from.id,
      issueDate: { $gt: addMonths(new Date(), -1) },
    })

    let isTherePaidCharge = chargesForUser.some((charge) =>
      Boolean(charge.paidDate)
    )

    if (!isTherePaidCharge && chargesForUser.length > 0) {
      // проверить статусы счетов и ситкануть с моей базой

      for (const charge of chargesForUser) {
        const config = {
          method: 'get',
          url: `${COINBASE_URL}/charges/${charge.paymentId}`,
          headers: CONIBASE_HEADERS,
        }
        const res = await axios(config)

        const hasPayments = res.data.data.payments?.length > 0

        // Вообще это не значит, что платеж прошел, статус может быть и error
        if (hasPayments) {
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
