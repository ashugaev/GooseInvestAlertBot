/**
 * Классификация причины, по которой алерт не удалось проверить.
 * Pure: без mongoose, без сети — только три входа и enum на выходе.
 */
export enum AlertFailureBucket {
  NoInstrument = 'noInstrument',
  NoPrice = 'noPrice',
  InvalidPrice = 'invalidPrice',
  Error = 'error', // непредвиденное исключение
}

export interface AlertFailureInputs {
  hasInstrument: boolean
  lastPrice: unknown
}

export const classifyAlertFailure = (
  inputs: AlertFailureInputs
): AlertFailureBucket | null => {
  if (!inputs.hasInstrument) return AlertFailureBucket.NoInstrument
  if (inputs.lastPrice === undefined || inputs.lastPrice === null) {
    return AlertFailureBucket.NoPrice
  }
  if (typeof inputs.lastPrice !== 'number' || inputs.lastPrice <= 0) {
    return AlertFailureBucket.InvalidPrice
  }
  return null
}

export interface FailureBuckets {
  [AlertFailureBucket.NoInstrument]: string[]
  [AlertFailureBucket.NoPrice]: string[]
  [AlertFailureBucket.InvalidPrice]: string[]
  [AlertFailureBucket.Error]: string[]
}

export const emptyBuckets = (): FailureBuckets => ({
  [AlertFailureBucket.NoInstrument]: [],
  [AlertFailureBucket.NoPrice]: [],
  [AlertFailureBucket.InvalidPrice]: [],
  [AlertFailureBucket.Error]: [],
})

/**
 * Считает топ-N tickerId внутри бакета (по числу алертов).
 * Используется в логах, чтобы видеть «какие именно тикеры мертвы».
 */
export const topTickersInBucket = (
  bucket: string[],
  limit = 5
): { tickerId: string; count: number }[] => {
  const counts: Record<string, number> = {}
  for (const entry of bucket) {
    const tickerId = entry.split(':')[0]
    counts[tickerId] = (counts[tickerId] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([tickerId, count]) => ({ tickerId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
