import { addMonths } from 'date-fns'

import { getBot } from '@/helpers/bot'
import { i18n } from '@/helpers/i18n'
import { wait } from '@/helpers/wait'
import { tronScanCheckTransaction } from '@/integrations/tronscan'
import { PremiumModel } from '@/models/Premium'
import { PremiumPaymentRequestModel } from '@/models/PremiumPayment'

const TRANSACTION_CHECK_INTERVAL = 1000 * 30 // 30 seconds
const TRANSACTION_LIFETIME = 1000 * 60 * 60 * 2 // 2 hour

export const paymentStatusChecker = async () => {
  while (true) {
    const transactionsWithHash = await PremiumPaymentRequestModel.find({
      paymentId: { $ne: null }, // есть хеш транзакции
      paidDate: null, // не подтверждена оплата
      cancelDate: null, // транзакция не протухла
    })

    if (transactionsWithHash.length) {
      for (const transaction of transactionsWithHash) {
        const bot = await getBot(transaction.botId)

        if (
          Date.now() - transaction.paymentIdAddedDate.getTime() >
          TRANSACTION_LIFETIME
        ) {
          transaction.cancelDate = new Date()
          await transaction.save()

          await bot.telegram.sendMessage(
            transaction.userId,
            i18n.t('ru', 'pay_timeout', {
              hash: transaction.paymentId,
            })
          )

          continue
        }

        // Проверяем статус транзакции
        const transactionStatus = await tronScanCheckTransaction(
          transaction.paymentId
        )

        if (transactionStatus?.confirmed) {
          transaction.paidDate = new Date()
          await transaction.save()

          await bot.telegram.sendMessage(
            transaction.userId,
            i18n.t('ru', 'pay_success')
          )

          // Start premium subscription
          const paidDate = new Date()
          const endDate = addMonths(paidDate, transaction.monthsCount)

          await PremiumModel.create({
            userId: transaction.userId,
            chatId: transaction.chatId,
            botId: transaction.botId,
            isTrial: false,
            end: endDate,
            start: paidDate,
          })

          // Cancel other user requests
          await PremiumPaymentRequestModel.updateMany(
            {
              userId: transaction.userId,
              paidDate: null,
            },
            {
              cancelDate: new Date(),
            }
          )
        }
      }
    }

    await wait(TRANSACTION_CHECK_INTERVAL)
  }
}
