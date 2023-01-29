import { sceneWrapper } from '../../helpers/sceneWrapper';

/**
 * Шаг сцена который отработает сразу же без ожидания действия
 */
export const immediateStep = (intent: string, callback: (ctx, state: Record<string, any>) => Promise<void>) => {
  const callbackWrapper = async (context) => {
    const { state } = context.wizard;

    await callback(context, state);
  };

  return sceneWrapper(intent, callbackWrapper, true);
};
