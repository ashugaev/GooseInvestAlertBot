import { ALERT_SCENES } from '../alert.constants'
import { AddAlertPayload } from '../alert.types'

/**
 * Ф-ция добавления алерта
 * Если на входе недостаточно данных она их запрашивает у юзера
 */
export const addAlert = (ctx, payload: AddAlertPayload) => {
  const { prices, ticker, instrumentId } = payload

  // if (!ticker) {
  //   ctx.scene.enter(ALERT_SCENES.askTicker)
  //
  //   return
  // }

  if (!prices) {
    ctx.scene.enter(ALERT_SCENES.askPrice, {
      payload,
      callback: addAlert
    })
  }
}
