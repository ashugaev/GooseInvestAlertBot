import { copyAlerts } from './copyAlerts'
import { instrumentsListUpdater } from './instrumentsListUpdater'
import { setupPriceChecker } from './priceChecker'
import { createShitEvents } from './shiftChecker'
import { startCronJob } from '../helpers/startCronJob'
import { shiftSender } from './shiftSender'

export const setupCheckers = (bot) => {
  // TODO: Не запускать не деве
  startCronJob({
    name: 'Check shifts',
    callback: createShitEvents,
    callbackArgs: [bot],
    // раз в день в 2 часа 0 минут
    period: '0 2 * * *'
  })

  startCronJob({
    name: 'Send shifts',
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
    period: '0 3 * * *',
    // TODO: Не проставлять в dev окружении
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

  // Непрерывные проверки цен
  setupPriceChecker(bot)
}
