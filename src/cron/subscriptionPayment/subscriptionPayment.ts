import { TelegrafContext } from 'telegraf/typings/context'

import { i18n } from '@/helpers/i18n'
import { tronScanCheckTransaction } from '@/integrations/tronscan'
import { PremiumPaymentRequestModel } from '@/models/PremiumPayment'

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
  })

  if (!paymentData) {
    console.info('user sent transaction number without requesting payment')
    return
  }

  const isValid =
    transaction?.trc20TransferInfo?.some(
      (transfer) =>
        transfer.to_address === process.env.TRONSCAN_WALLET_ADDRESS &&
        Number(transfer.amount_str) / 1e6 >= paymentData.amount &&
        paymentData.issueDate.getTime() <=
          new Date(transaction.timestamp).getTime()
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
