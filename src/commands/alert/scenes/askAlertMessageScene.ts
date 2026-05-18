import { waitMessageStep } from '@/scenes'
const WizardScene = require('telegraf/scenes/wizard')

import { i18n } from '../../../helpers/i18n'
import { sceneWrapper } from '../../../helpers/sceneWrapper'
import { ALERT_SCENES } from '../alert.constants'

/**
 * Asks the user for an informational message for the alert
 */
const requestStep = sceneWrapper('ask-alert-message-request', async (ctx) => {
  ctx.replyWithHTML(i18n.t('ru', 'alertCreatedAddMessage'))

  return ctx.wizard.next()
})

/**
 * Updates the message on the alert.
 *
 * TODO: Ideally remove the update execution and keep only data collection here.
 */
const validateAndSaveStep = waitMessageStep(
  'ask-alert-message-validate-and-save',
  async (ctx, message, state) => {
    const { payload, callback } = state

    const { createdItemsList } = payload

    if (createdItemsList.length !== 1) {
      throw new Error('Cannot attach a message to multiple alerts')
    }

    if (!message.length) {
      throw new Error('Empty message')
    }

    callback({ message })

    return ctx.scene.leave()
  }
)

export const askAlertMessageScene = new WizardScene(
  ALERT_SCENES.askMessage,
  requestStep,
  validateAndSaveStep
)
