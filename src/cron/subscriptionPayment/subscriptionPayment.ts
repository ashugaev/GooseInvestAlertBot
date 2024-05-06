import { TelegrafContext } from 'telegraf/typings/context'

import { i18n } from '@/helpers/i18n'
import { tronScanCheckTransaction } from '@/integrations/tronscan'
import { PremiumPaymentRequestModel } from '@/models/PremiumPayment'

const TRONSCAN_WALLET_ADDRESS = process.env.TRONSCAN_WALLET_ADDRESS

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

  // Diff less or equal 1 day
  const isDateCorrect =
    Math.abs(
      paymentData.issueDate.getDate() -
        new Date(transaction.timestamp).getDate()
    ) <= 1

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

  // Добавим и будем ждать смены статуса
  paymentData.paymentId = transactionId
  paymentData.paymentIdAddedDate = new Date()
  await paymentData.save()
}
