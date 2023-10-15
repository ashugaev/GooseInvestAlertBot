export function addPercent(
  base: number,
  percentage: number,
  precision?: number
): number {
  const result = base + base * (percentage / 100)
  const res = precision !== undefined ? result.toFixed(precision) : result

  return Number(res)
}
