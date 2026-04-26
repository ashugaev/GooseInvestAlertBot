import { log } from '@/helpers'
import { getBot } from '@/helpers/bot'
import { wait } from '@/helpers/wait'
import { tronScanCheckTransaction } from '@/integrations/tronscan'
import { PremiumModel } from '@/models/Premium'
import { PremiumPaymentRequestModel } from '@/models/PremiumPayment'

import {
  PaymentTransaction,
  processPendingTransaction,
  ProcessTransactionDeps,
} from './processPendingTransaction'

const logPrefix = '[PAYMENT STATUS CHECKER]'
const TRANSACTION_CHECK_INTERVAL = 1000 * 30 // 30 seconds

const defaultDeps: ProcessTransactionDeps = {
  getBot,
  tronScanCheckTransaction,
  premiumModelCreate: (data) => PremiumModel.create(data as never),
  cancelOtherUserRequests: async (userId) => {
    await PremiumPaymentRequestModel.updateMany(
      { userId, paidDate: null },
      { cancelDate: new Date() }
    )
  },
}

export const paymentStatusChecker = async () => {
  while (true) {
    const transactionsWithHash = (await PremiumPaymentRequestModel.find({
      paymentId: { $ne: null },
      paidDate: null,
      cancelDate: null,
    })) as unknown as PaymentTransaction[]

    for (const transaction of transactionsWithHash) {
      try {
        await processPendingTransaction(transaction, defaultDeps)
      } catch (e) {
        log.error(
          logPrefix,
          'transaction check failed',
          transaction.paymentId,
          transaction.userId,
          e
        )
      }
    }

    await wait(TRANSACTION_CHECK_INTERVAL)
  }
}
