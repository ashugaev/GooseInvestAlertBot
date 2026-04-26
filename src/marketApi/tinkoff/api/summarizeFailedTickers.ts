/**
 * Сводка для логов вместо per-ticker записи.
 * Возвращает null, если бакет пустой или меньше порога.
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
