import { TelegrafContext } from 'telegraf/typings/context'

import { i18n } from '@/helpers/i18n'
import { tronScanCheckTransaction } from '@/integrations/tronscan'
import { PremiumPaymentRequestModel } from '@/models/PremiumPayment'

const TRONSCAN_WALLET_ADDRESS = process.env.TRONSCAN_WALLET_ADDRESS

const ONE_DAY_MS = 24 * 60 * 60 * 1000

/**
 * Previously the check compared days of month via `Date#getDate()`, which
 * produced a bogus "pay_cant_find" across month boundaries and for any
 * delay greater than 1 calendar day. Compare absolute millisecond delta.
 */
export const isPaymentDateWithinOneDay = (
  issueDate: Date,
  transactionTimestampMs: number
): boolean =>
  Math.abs(issueDate.getTime() - transactionTimestampMs) <= ONE_DAY_MS

export const subscriptionPaymentCheckerAdd = async ({
  userId,
  transactionId,
  ctx,
}: {
  userId: number
  transactionId: string
  ctx: TelegrafContext
}) => {
  const transaction = await tronScanCheckTransaction(transactionId)

  // Getting the last payment request
  const paymentData = await PremiumPaymentRequestModel.findOne({
    userId,
    cancelDate: null,
    paidDate: null,
    paymentId: null,
  })

  if (!paymentData) {
    console.info('user sent transaction number without requesting payment')
    ctx.replyWithHTML(i18n.t('ru', 'pay_no_invoice'))
    return
  }

  // Check if hash was used
  const data = await PremiumPaymentRequestModel.findOne({
    paymentId: transactionId,
  })

  if (data) {
    ctx.replyWithHTML(i18n.t('ru', 'pay_hash_used'))
    return
  }

  const isDateCorrect = isPaymentDateWithinOneDay(
    paymentData.issueDate,
    transaction.timestamp
  )

  const isValid =
    transaction?.trc20TransferInfo?.some(
      (transfer) =>
        transfer.to_address === TRONSCAN_WALLET_ADDRESS &&
        Number(transfer.amount_str) / 1e6 >= paymentData.amount &&
        isDateCorrect
    ) || false

  if (!isValid) {
    ctx.replyWithHTML(i18n.t('ru', 'pay_cant_find'))
    return
  }

  ctx.replyWithHTML('🔄 Транзакция найдена. Жду пока она подтвердится')

  // Save it and wait for the status to change
  paymentData.paymentId = transactionId
  paymentData.paymentIdAddedDate = new Date()
  await paymentData.save()
}
