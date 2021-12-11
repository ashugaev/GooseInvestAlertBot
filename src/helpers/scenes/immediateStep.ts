import { sceneWrapper } from '../sceneWrapper'

/**
 * Шаг сцена который отработает сразу же без ожидания действия
 */
export const immediateStep = (intent: string, callback: (ctx) => void | Promise<void>) => sceneWrapper(intent, callback)
