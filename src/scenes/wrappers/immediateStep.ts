import { sceneWrapper } from '../../helpers/sceneWrapper'

/**
 * Scene step that runs immediately, without waiting for user action
 */
export const immediateStep = (
  intent: string,
  callback: (ctx, state: Record<string, any>) => Promise<void>
) => {
  const callbackWrapper = async (context) => {
    const { state } = context.wizard

    await callback(context, state)
  }

  return sceneWrapper(intent, callbackWrapper, true)
}
