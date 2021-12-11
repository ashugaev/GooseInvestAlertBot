import { sceneWrapper } from '../helpers/sceneWrapper'

/**
 * Это сценарий обработки дубликатов тикеров
 * Встраивается в вдругие сценарии
 */
const sentDuplicatesMessageScene = sceneWrapper('check-ticker-duplicates-send-message', (ctx) => {
  ctx.replyWithHTML('kek')
  return ctx.wizard.next()
  // return ctx.scene.leave()
})

export const checkTickerDuplicatesScene = [
  sentDuplicatesMessageScene
]
