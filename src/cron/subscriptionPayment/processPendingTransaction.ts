import { addMonths } from 'date-fns'

import { i18n } from '@/helpers/i18n'

const TRANSACTION_LIFETIME = 1000 * 60 * 60 * 2 // 2 hour

export interface PaymentTransaction {
  paymentId: string
  paymentIdAddedDate: Date
  userId: number
  chatId: number
  botId: number
  monthsCount: number
  cancelDate: Date | null
  paidDate: Date | null
  save: () => Promise<unknown>
}

export interface BotLike {
  telegram: { sendMessage: (userId: number, text: string) => Promise<unknown> }
}

export interface ProcessTransactionDeps {
  getBot: (botId: number) => Promise<BotLike>
  tronScanCheckTransaction: (
    hash: string
  ) => Promise<{ confirmed?: boolean } | undefined>
  premiumModelCreate: (data: unknown) => Promise<unknown>
  cancelOtherUserRequests: (userId: number) => Promise<unknown>
  now?: () => number
}

/**
 * Обработка одной заявки на оплату. Вынесено для тестируемости и чтобы
 * сбой на одной транзакции (например, 5xx Tronscan) не клал весь цикл.
 */
export const processPendingTransaction = async (
  transaction: PaymentTransaction,
  deps: ProcessTransactionDeps
): Promise<void> => {
  const now = deps.now ? deps.now() : Date.now()
  const bot = await deps.getBot(transaction.botId)

  if (now - transaction.paymentIdAddedDate.getTime() > TRANSACTION_LIFETIME) {
    transaction.cancelDate = new Date(now)
    await transaction.save()
    await bot.telegram.sendMessage(
      transaction.userId,
      i18n.t('ru', 'pay_timeout', { hash: transaction.paymentId })
    )
    return
  }

  const transactionStatus = await deps.tronScanCheckTransaction(
    transaction.paymentId
  )
  if (!transactionStatus?.confirmed) return

  transaction.paidDate = new Date(now)
  await transaction.save()
  await bot.telegram.sendMessage(
    transaction.userId,
    i18n.t('ru', 'pay_success')
  )

  const paidDate = new Date(now)
  const endDate = addMonths(paidDate, transaction.monthsCount)
  await deps.premiumModelCreate({
    userId: transaction.userId,
    chatId: transaction.chatId,
    botId: transaction.botId,
    isTrial: false,
    end: endDate,
    start: paidDate,
  })
  await deps.cancelOtherUserRequests(transaction.userId)
}
