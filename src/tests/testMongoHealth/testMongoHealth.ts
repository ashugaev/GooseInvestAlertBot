import {
  isMongoHealthy,
  isMongoReady,
  notifyMongoIssueToBoss,
} from '@/db/mongoose'
import { log } from '@/helpers'

const logPrefix = '[MONGO HEALTH]'
const CHECK_PERIOD_MS = Number(process.env.MONGO_HEALTHCHECK_PERIOD_MS || 60000)

let monitorStarted = false
let lastHealthState: boolean | null = null

export const testMongoHealth = () => {
  if (monitorStarted) {
    return
  }

  monitorStarted = true

  const checkMongoHealth = async () => {
    try {
      const isHealthy = isMongoReady() ? await isMongoHealthy() : false

      if (lastHealthState === isHealthy) {
        return
      }

      lastHealthState = isHealthy

      if (isHealthy) {
        log.info(logPrefix, 'Mongo connection is healthy')
      } else {
        log.error(logPrefix, 'Mongo is not ready or ping failed')
        await notifyMongoIssueToBoss('Mongo health check failed')
      }
    } catch (error) {
      log.error(logPrefix, 'Health check crashed', error)
    }
  }

  void checkMongoHealth()
  setInterval(checkMongoHealth, CHECK_PERIOD_MS)
}
