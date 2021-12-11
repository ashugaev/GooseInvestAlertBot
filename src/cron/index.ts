import { copyAlerts } from './copyAlerts'
import { instrumentsListUpdater } from './instrumentsListUpdater'
import { setupPriceChecker } from './priceChecker'
import { createShitEvents } from './statChecker'
import { startCronJob } from '../helpers/startCronJob'
import { shiftSender } from './statSender'
import { setupShiftsChecker } from './shiftsChecker'
import { log } from '../helpers/log'

export const setupCheckers = (bot) => {
  // TODO: Не запускать не деве
  startCronJob({
    name: 'Check stat',
    callback: createShitEvents,
    callbackArgs: [bot],
    // раз в день в 2 часа 0 минут
    period: '0 2 * * *'
  })

  startCronJob({
    name: 'Send stat',
    callback: shiftSender,
    callbackArgs: [bot],
    // раз в час
    period: '0 * * * *'
  })

  startCronJob({
    name: 'Update Instruments List',
    callback: instrumentsListUpdater,
    callbackArgs: [bot],
    // раз день в 3 часа
    period: '0 3 * * *'
    // TODO: Раскомментить для первого деплоя
    // executeBeforeInit: true
  })

  // Дамп коллекции с алертами
  startCronJob({
    name: 'Copy alerts collection',
    callback: copyAlerts,
    callbackArgs: [bot],
    // раз в час
    period: '0 * * * *',
    executeBeforeInit: true
  })

  // Мониторинг достижения уровней
  setupPriceChecker(bot)

  // Мониторинг скорости
  try {
    setupShiftsChecker(bot)
  } catch (e) {
    log.error('[Cron] Упал чекер скорости цены')
  }
}
