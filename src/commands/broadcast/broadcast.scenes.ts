import { Composer } from 'telegraf'

import {
  BROADCAST_ACTIONS,
  BROADCAST_SCENES,
} from '@/commands/broadcast/broadcast.constants'
import {
  buildConfirmKeyboard,
  executeBroadcast,
  formatBroadcastReport,
} from '@/commands/broadcast/broadcast.utils'
import { i18n } from '@/helpers/i18n'
import { log } from '@/helpers/log'
import { sceneWrapper } from '@/helpers/sceneWrapper'
import { triggerActionRegexp } from '@/helpers/triggerActionRegexp'
import { UserModel } from '@/models'
import { immediateStep } from '@/scenes'
const WizardScene = require('telegraf/scenes/wizard')

/** Resolve user language — ctx.i18n is NOT available in wizard steps 2+ */
const lang = (ctx): string => ctx.dbuser?.language ?? 'ru'

/**
 * Telegraf 3.x lacks telegram.copyMessage(). Call the Bot API directly.
 * https://core.telegram.org/bots/api#copymessage
 */
const copyMessage = (
  ctx,
  chatId: number,
  fromChatId: number,
  messageId: number
) =>
  ctx.telegram.callApi('copyMessage', {
    chat_id: chatId,
    from_chat_id: fromChatId,
    message_id: messageId,
  })

// Step 1: Ask for the message to broadcast
const askForMessageStep = immediateStep('broadcastAskMessage', async (ctx) => {
  await ctx.replyWithHTML(i18n.t(lang(ctx), 'broadcast_askMessage'))
  return ctx.wizard.next()
})

// Step 2: Capture any message and ask for confirmation
const captureMessageStep = (() => {
  const step = new Composer()

  const handler = sceneWrapper('broadcastCaptureMessage', async (ctx) => {
    const { state } = ctx.wizard
    const msg = ctx.message

    if (!msg) {
      await ctx.replyWithHTML(i18n.t(lang(ctx), 'broadcast_askMessage'))
      return
    }

    // Count users for the current bot
    const userCount = await UserModel.countDocuments({ botId: ctx.goose.id })

    state.broadcast = {
      fromChatId: msg.chat.id,
      messageId: msg.message_id,
      userCount,
      running: false,
    }

    await ctx.replyWithHTML(
      i18n.t(lang(ctx), 'broadcast_confirm', { userCount }),
      { reply_markup: buildConfirmKeyboard() }
    )

    return ctx.wizard.next()
  })

  return step.on('message', handler)
})()

// Step 3: Handle confirm / test / cancel button clicks
const confirmStep = (() => {
  const step = new Composer()

  const handler = sceneWrapper('broadcastConfirm', async (ctx) => {
    const { state } = ctx.wizard
    const actionPayload = JSON.parse(ctx.match[1])
    const mode: string = actionPayload.m
    const l = lang(ctx)

    // Guard: prevent double-click on "Send to all"
    if (state.broadcast?.running) {
      await ctx.answerCbQuery('Broadcast is already running')
      return
    }

    await ctx.answerCbQuery()

    // --- Cancel ---
    if (mode === 'no') {
      await ctx.editMessageText(i18n.t(l, 'broadcast_cancelled'), {
        parse_mode: 'HTML',
      })
      return ctx.scene.leave()
    }

    // --- Test (send only to boss) ---
    if (mode === 'test') {
      const { fromChatId, messageId, userCount } = state.broadcast

      try {
        await copyMessage(ctx, ctx.from.id, fromChatId, messageId)
        await ctx.editMessageText(
          i18n.t(l, 'broadcast_testSent', { userCount }),
          { parse_mode: 'HTML', reply_markup: buildConfirmKeyboard() }
        )
      } catch (err) {
        log.error('Broadcast test-send failed:', err)
        await ctx.editMessageText(
          i18n.t(l, 'broadcast_testFailed', {
            error: err?.message ?? String(err),
          }),
          { parse_mode: 'HTML', reply_markup: buildConfirmKeyboard() }
        )
      }

      // Stay on same step — boss can test again, confirm, or cancel
      return
    }

    // --- Send to all ---
    state.broadcast.running = true

    await ctx.editMessageText(i18n.t(l, 'broadcast_started'), {
      parse_mode: 'HTML',
    })

    const users = await UserModel.find(
      { botId: ctx.goose.id },
      { id: 1 }
    ).lean()

    // Deduplicate — User.id is not unique in DB
    const uniqueIds = [...new Set(users.map((u) => u.id))]

    const { fromChatId, messageId } = state.broadcast

    // Report progress ~4 times during the broadcast, minimum every 100 users
    const progressInterval = Math.max(100, Math.floor(uniqueIds.length / 4))

    const result = await executeBroadcast(
      uniqueIds,
      async (userId) => {
        await copyMessage(ctx, userId, fromChatId, messageId)
      },
      {
        onProgress(processed, total) {
          if (processed % progressInterval === 0) {
            const pct = ((processed / total) * 100).toFixed(0)
            ctx.telegram
              .sendMessage(ctx.from.id, `${pct}% (${processed}/${total})...`)
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              .catch(() => {})
          }
        },
      }
    )

    log.info(
      `Broadcast done: ${result.delivered}/${result.total} delivered, ` +
        `${result.failed} failed`
    )

    try {
      await ctx.replyWithHTML(formatBroadcastReport(result), {
        disable_web_page_preview: true,
      })
    } catch (reportErr) {
      log.error('Failed to send broadcast report:', reportErr)
    }

    return ctx.scene.leave()
  })

  return step.action(triggerActionRegexp(BROADCAST_ACTIONS.confirm), handler)
})()

export const broadcastScenes = new WizardScene(
  BROADCAST_SCENES.main,
  askForMessageStep,
  captureMessageStep,
  confirmStep
)
