import { Composer } from 'telegraf'

import { sceneWrapper } from '../../helpers/sceneWrapper'

export const waitMessageStep = (
  intent: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (ctx, text: string, state: Record<string, any>) => Promise<void>
) => {
  const step = new Composer()

  const callbackWrapper = async (context) => {
    const { text } = context.message
    const { state } = context.wizard

    await callback(context, text, state)
  }

  // Does NOT start with /
  return step.hears(/^(?!\/).+$/, sceneWrapper(intent, callbackWrapper))
}
