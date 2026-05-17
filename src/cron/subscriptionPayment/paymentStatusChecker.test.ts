import {
  PaymentTransaction,
  processPendingTransaction,
  ProcessTransactionDeps,
} from '@/cron/subscriptionPayment/processPendingTransaction'

const makeTx = (
  over: Partial<PaymentTransaction> = {}
): PaymentTransaction => ({
  paymentId: 'hash1',
  paymentIdAddedDate: new Date('2026-04-26T10:00:00Z'),
  userId: 1,
  chatId: 1,
  botId: 42,
  monthsCount: 1,
  cancelDate: null,
  paidDate: null,
  save: jest.fn().mockResolvedValue(undefined),
  ...over,
})

const makeDeps = (
  over: Partial<ProcessTransactionDeps> & {
    confirmed?: boolean
    sendMessage?: jest.Mock
  } = {}
): ProcessTransactionDeps & { sendMessage: jest.Mock } => {
  const sendMessage = over.sendMessage ?? jest.fn().mockResolvedValue(undefined)
  return {
    getBot: jest.fn().mockResolvedValue({ telegram: { sendMessage } }) as never,
    tronScanCheckTransaction: jest
      .fn()
      .mockResolvedValue({ confirmed: over.confirmed ?? false }) as never,
    premiumModelCreate: jest.fn().mockResolvedValue(undefined),
    cancelOtherUserRequests: jest.fn().mockResolvedValue(undefined),
    now: () => new Date('2026-04-26T10:30:00Z').getTime(),
    ...over,
    sendMessage,
  }
}

describe('processPendingTransaction', () => {
  it('does nothing when transaction is not yet confirmed', async () => {
    const tx = makeTx()
    const deps = makeDeps({ confirmed: false })
    await processPendingTransaction(tx, deps)
    expect(tx.paidDate).toBeNull()
    expect(deps.premiumModelCreate).not.toHaveBeenCalled()
    expect(deps.cancelOtherUserRequests).not.toHaveBeenCalled()
  })

  it('marks paidDate, creates premium and notifies user when confirmed', async () => {
    const tx = makeTx()
    const deps = makeDeps({ confirmed: true })
    await processPendingTransaction(tx, deps)
    expect(tx.paidDate).toBeInstanceOf(Date)
    expect(deps.premiumModelCreate).toHaveBeenCalledTimes(1)
    expect(deps.cancelOtherUserRequests).toHaveBeenCalledWith(1)
    expect(deps.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('cancels and notifies on timeout (>2h since hash added)', async () => {
    const tx = makeTx({
      paymentIdAddedDate: new Date('2026-04-26T07:00:00Z'),
    })
    const deps = makeDeps({ confirmed: true }) // confirmed=true must be ignored
    await processPendingTransaction(tx, deps)
    expect(tx.cancelDate).toBeInstanceOf(Date)
    expect(tx.paidDate).toBeNull()
    expect(deps.tronScanCheckTransaction).not.toHaveBeenCalled()
    expect(deps.premiumModelCreate).not.toHaveBeenCalled()
    expect(deps.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('propagates errors so the outer loop can isolate them', async () => {
    const tx = makeTx()
    const deps = makeDeps({
      tronScanCheckTransaction: jest
        .fn()
        .mockRejectedValue(new Error('Tronscan 503')) as never,
    })
    await expect(processPendingTransaction(tx, deps)).rejects.toThrow(
      'Tronscan 503'
    )
    expect(tx.paidDate).toBeNull()
    expect(tx.cancelDate).toBeNull()
  })
})
