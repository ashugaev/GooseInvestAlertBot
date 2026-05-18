export interface BroadcastResult {
  delivered: number
  failed: number
  total: number
  errors: Array<{ userId: number; error: string }>
}

/**
 * Sends a message to a list of users via the provided send function.
 * Each call is wrapped in try/catch so a single failure never aborts the run.
 *
 * @param userIds  – unique Telegram user IDs to deliver to
 * @param sendFn   – async callback that sends one message (injected for testability)
 * @param delayMs  – pause between sends to respect Telegram rate limits (default 50 ms)
 */
export async function executeBroadcast(
  userIds: number[],
  sendFn: (userId: number) => Promise<void>,
  delayMs = 50
): Promise<BroadcastResult> {
  const result: BroadcastResult = {
    delivered: 0,
    failed: 0,
    total: userIds.length,
    errors: [],
  }

  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i]

    try {
      await sendFn(userId)
      result.delivered++
    } catch (err) {
      result.failed++
      result.errors.push({
        userId,
        error: err?.message ?? String(err),
      })
    }

    // Rate-limit pause between sends (skip after the last one)
    if (delayMs > 0 && i < userIds.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }

  return result
}

export function formatBroadcastReport(result: BroadcastResult): string {
  const pct =
    result.total > 0
      ? ((result.delivered / result.total) * 100).toFixed(1)
      : '0.0'

  const lines = [
    '<b>Broadcast report</b>',
    '',
    `Total: ${result.total}`,
    `Delivered: ${result.delivered}`,
    `Failed: ${result.failed}`,
    `Delivery rate: ${pct}%`,
  ]

  if (result.errors.length > 0) {
    const maxShown = 20 // avoid huge messages
    lines.push('', '<b>Failed users:</b>')
    for (const e of result.errors.slice(0, maxShown)) {
      lines.push(`<code>${e.userId}</code> — ${e.error}`)
    }
    if (result.errors.length > maxShown) {
      lines.push(`... and ${result.errors.length - maxShown} more`)
    }
  }

  return lines.join('\n')
}
