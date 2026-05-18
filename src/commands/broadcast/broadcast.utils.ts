import { BROADCAST_ACTIONS } from '@/commands/broadcast/broadcast.constants'
import { createActionString } from '@/helpers'

export interface BroadcastResult {
  delivered: number
  failed: number
  total: number
  errors: Array<{ userId: number; error: string }>
}

export interface BroadcastOptions {
  /** Pause between sends to respect Telegram rate limits (default 50 ms) */
  delayMs?: number
  /**
   * Called after each send attempt with (processed, total).
   * Errors thrown inside onProgress are silently ignored so they
   * never abort the broadcast.
   */
  onProgress?: (processed: number, total: number) => void | Promise<void>
}

/**
 * Sends a message to a list of users via the provided send function.
 * Each call is wrapped in try/catch so a single failure never aborts the run.
 */
export async function executeBroadcast(
  userIds: number[],
  sendFn: (userId: number) => Promise<void>,
  options: BroadcastOptions = {}
): Promise<BroadcastResult> {
  const { delayMs = 50, onProgress } = options

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

    if (onProgress) {
      try {
        await onProgress(i + 1, userIds.length)
      } catch {
        // Progress notifications must never abort the broadcast
      }
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
      lines.push(`<code>${e.userId}</code> — ${escapeHtml(e.error)}`)
    }
    if (result.errors.length > maxShown) {
      lines.push(`... and ${result.errors.length - maxShown} more`)
    }
  }

  return lines.join('\n')
}

export function buildConfirmKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: 'Send to all',
          callback_data: createActionString(BROADCAST_ACTIONS.confirm, {
            m: 'all',
          }),
        },
      ],
      [
        {
          text: 'Test (only me)',
          callback_data: createActionString(BROADCAST_ACTIONS.confirm, {
            m: 'test',
          }),
        },
      ],
      [
        {
          text: 'Cancel',
          callback_data: createActionString(BROADCAST_ACTIONS.confirm, {
            m: 'no',
          }),
        },
      ],
    ],
  }
}

/** Escape HTML special chars in error strings to avoid breaking Telegram's parser */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
