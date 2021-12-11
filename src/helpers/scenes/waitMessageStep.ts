import { sceneWrapper } from '../sceneWrapper'
import { Composer } from 'telegraf'

export const waitMessageStep = (intent: string, callback: (ctx) => void | Promise<void>) => {
  const step = new Composer()

  // НЕ начинается с /
  return step.hears(/^(?!\/).+$/, sceneWrapper(intent, callback))
}
