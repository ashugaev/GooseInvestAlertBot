import { testAlertsTriggered } from '@/tests/testAlertsTriggered/testsAlertsTriggered'
import { testMongoHealth } from '@/tests/testMongoHealth/testMongoHealth'
import { testPriceUpdater } from '@/tests/testPriceUpdater/testPriceUpdater'

export const startTests = async () => {
  testMongoHealth()
  testPriceUpdater()
  testAlertsTriggered()
}
