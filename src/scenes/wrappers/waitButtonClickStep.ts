import { Composer } from 'telegraf'

import { sceneWrapper } from '../../helpers/sceneWrapper'
import { triggerActionRegexp } from '../../helpers/triggerActionRegexp'

export const waitButtonClickStep = (actionName, intent: string, callback: (ctx, actionPayload: Record<string, any>, state: Record<string, any>) => Promise<void>) => {
  const step = new Composer()

  const callbackWrapper = async (context) => {
    const { state } = context.wizard
    const actionPayload = JSON.parse(context.match[1])

    await callback(context, actionPayload, state)
  }

  return step.action(triggerActionRegexp(actionName), sceneWrapper(intent, callbackWrapper))
}
