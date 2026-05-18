import { Composer } from 'telegraf'

import {
  BROADCAST_ACTIONS,
  BROADCAST_SCENES,
} from '@/commands/broadcast/broadcast.constants'
import {
  executeBroadcast,
  formatBroadcastReport,
} from '@/commands/broadcast/broadcast.utils'
import { createActionString } from '@/helpers'
import { log } from '@/helpers/log'
import { sceneWrapper } from '@/helpers/sceneWrapper'
import { UserModel } from '@/models'
import { immediateStep } from '@/scenes'
import { waitButtonClickStep } from '@/scenes/wrappers'
const WizardScene = require('telegraf/scenes/wizard')

// Step 1: Ask for the message to broadcast
const askForMessageStep = immediateStep('broadcastAskMessage', async (ctx) => {
  await ctx.replyWithHTML(ctx.i18n.t('broadcast_askMessage'))
  return ctx.wizard.next()
})

// Step 2: Capture any message and ask for confirmation
const captureMessageStep = (() => {
  const step = new Composer()

  const handler = sceneWrapper('broadcastCaptureMessage', async (ctx) => {
    const { state } = ctx.wizard
    const msg = ctx.message

    if (!msg) {
      await ctx.replyWithHTML(ctx.i18n.t('broadcast_askMessage'))
      return
    }

    state.broadcast = {
      fromChatId: msg.chat.id,
      messageId: msg.message_id,
    }

    // Count users for the current bot
    const userCount = await UserModel.countDocuments({ botId: ctx.goose.id })

    await ctx.replyWithHTML(ctx.i18n.t('broadcast_confirm', { userCount }), {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Send',
              callback_data: createActionString(BROADCAST_ACTIONS.confirm, {
                ok: 1,
              }),
            },
            {
              text: 'Cancel',
              callback_data: createActionString(BROADCAST_ACTIONS.confirm, {
                ok: 0,
              }),
            },
          ],
        ],
      },
    })

    return ctx.wizard.next()
  })

  // Listen for any message type (text, photo, video, sticker, etc.)
  return step.on('message', handler)
})()

// Step 3: Handle confirmation button click
const confirmStep = waitButtonClickStep(
  BROADCAST_ACTIONS.confirm,
  'broadcastConfirm',
  async (ctx, actionPayload, state) => {
    if (!actionPayload.ok) {
      await ctx.replyWithHTML(ctx.i18n.t('broadcast_cancelled'))
      return ctx.scene.leave()
    }

    const { fromChatId, messageId } = state.broadcast

    await ctx.replyWithHTML(ctx.i18n.t('broadcast_started'))

    const users = await UserModel.find(
      { botId: ctx.goose.id },
      { id: 1 }
    ).lean()

    const userIds: number[] = users.map((u) => u.id)

    const result = await executeBroadcast(userIds, async (userId) => {
      await ctx.telegram.copyMessage(userId, fromChatId, messageId)
    })

    log.info(
      `Broadcast done: ${result.delivered}/${result.total} delivered, ` +
        `${result.failed} failed`
    )

    await ctx.replyWithHTML(formatBroadcastReport(result), {
      disable_web_page_preview: true,
    })

    return ctx.scene.leave()
  }
)

export const broadcastScenes = new WizardScene(
  BROADCAST_SCENES.main,
  askForMessageStep,
  captureMessageStep,
  confirmStep
)
