import { testAlertsTriggered } from '@/tests/testAlertsTriggered/testsAlertsTriggered'
import { testPriceUpdater } from '@/tests/testPriceUpdater/testPriceUpdater'

export const startTests = async (bot) => {
  testPriceUpdater(bot)
  testAlertsTriggered(bot)
}
