/**
 * Classify why an alert could not be evaluated.
 * Pure: no mongoose, no network — three inputs and an enum out.
 */
export enum AlertFailureBucket {
  NoInstrument = 'noInstrument',
  NoPrice = 'noPrice',
  InvalidPrice = 'invalidPrice',
  Error = 'error', // unexpected exception
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
 * Counts the top-N tickerIds inside a bucket (by number of alerts).
 * Used in logs so we can see which exact tickers are dead.
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
