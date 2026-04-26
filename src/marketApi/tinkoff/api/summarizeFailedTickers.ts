/**
 * Log summary instead of per-ticker entries.
 * Returns null if the bucket is empty or below the threshold.
 */
export interface TickerSummary {
  count: number
  sample: string[]
}

export const summarizeFailedTickers = (
  ids: string[],
  options: { minCount?: number; sampleSize?: number } = {}
): TickerSummary | null => {
  const { minCount = 1, sampleSize = 5 } = options
  if (!ids.length || ids.length < minCount) return null
  return {
    count: ids.length,
    sample: ids.slice(0, sampleSize),
  }
}
