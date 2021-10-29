/**
 * Мониторит скорость изменения цены
 */
import { wait } from '../../helpers/wait'

export const setupShiftsChecker = async (bot) => {
  let customTimeForWait = null

  while (true) {
    // Между итерациями задержка в 30 секунд, либо то время, которое проставили в последней итерации
    await wait(customTimeForWait ?? 30000)
    customTimeForWait = null

    try {

    } catch (e) {

    }

    /**
       * TODO:
       *
       * - формируем свечи по символам которые отслеживаем
       * - делаем проверку на срабатывание
       */
  }
}
