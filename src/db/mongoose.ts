import axios from 'axios'
import mongoose from 'mongoose'

import { log } from '@/helpers/log'
import { wait } from '@/helpers/wait'

const logPrefix = '[MONGO]'

const CONNECT_TIMEOUT_MS = Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 10000)
const SOCKET_TIMEOUT_MS = Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 100000)
const RETRY_DELAY_MS = Number(process.env.MONGO_RETRY_DELAY_MS || 5000)
const WAIT_LOG_THROTTLE_MS = Number(
  process.env.MONGO_WAIT_LOG_THROTTLE_MS || 30000
)
const RETRY_LOG_THROTTLE_MS = Number(
  process.env.MONGO_RETRY_LOG_THROTTLE_MS || 30000
)
const ERROR_LOG_THROTTLE_MS = Number(
  process.env.MONGO_ERROR_LOG_THROTTLE_MS || 30000
)
const STARTUP_MAX_ATTEMPTS = Number(process.env.MONGO_STARTUP_MAX_ATTEMPTS || 3)
const STARTUP_RETRY_DELAY_MS = Number(
  process.env.MONGO_STARTUP_RETRY_DELAY_MS || 2000
)
const BOSS_ALERT_THROTTLE_MS = Number(
  process.env.MONGO_BOSS_ALERT_THROTTLE_MS || 300000
)

const READY_STATE_NAMES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

let connectPromise: Promise<typeof mongoose> | null = null
let ensurePromise: Promise<void> | null = null
let listenersAreSetup = false
let lastWaitLogAt = 0
let lastRetryLogAt = 0
let lastConnectionErrorLogAt = 0
let lastBossAlertAt = 0
let wasDisconnectedLogged = false

interface EnsureMongoConnectionOptions {
  crashOnFailure?: boolean
  maxAttempts?: number
  retryDelayMs?: number
}

const getReadyState = () =>
  READY_STATE_NAMES[mongoose.connection.readyState] ||
  `unknown(${mongoose.connection.readyState})`

export const isMongoReady = () => mongoose.connection.readyState === 1

const isMongoConnecting = () => mongoose.connection.readyState === 2
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error || 'Unknown error')

export const notifyMongoIssueToBoss = async (message: string) => {
  const bossId = process.env.BOSS_TG_ID
  const botToken = process.env.TELEGRAM_TOKEN

  if (!bossId || !botToken) {
    return
  }

  const now = Date.now()

  if (now - lastBossAlertAt < BOSS_ALERT_THROTTLE_MS) {
    return
  }

  lastBossAlertAt = now

  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: bossId,
      text: `${logPrefix} ${message}`,
      disable_notification: true,
    })
  } catch (error) {
    log.error(logPrefix, 'Failed to notify boss', getErrorMessage(error))
  }
}

const connectMongo = async () => {
  if (isMongoReady() || isMongoConnecting()) {
    return
  }

  if (connectPromise) {
    await connectPromise
    return
  }

  connectPromise = mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: CONNECT_TIMEOUT_MS,
      serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
      socketTimeoutMS: SOCKET_TIMEOUT_MS,
    })
    .finally(() => {
      connectPromise = null
    })

  await connectPromise
}

const setupListeners = () => {
  if (listenersAreSetup) {
    return
  }

  listenersAreSetup = true

  mongoose.set('useCreateIndex', true)

  mongoose.connection.on('connected', () => {
    wasDisconnectedLogged = false
    log.info(logPrefix, 'Connected')
  })

  mongoose.connection.on('reconnected', () => {
    wasDisconnectedLogged = false
    log.info(logPrefix, 'Reconnected')
  })

  mongoose.connection.on('disconnected', () => {
    if (!wasDisconnectedLogged) {
      log.error(logPrefix, 'Disconnected')
      wasDisconnectedLogged = true
      void notifyMongoIssueToBoss('Mongo disconnected')
    }

    void ensureMongoConnection('disconnected event')
  })

  mongoose.connection.on('error', (error) => {
    const now = Date.now()

    if (now - lastConnectionErrorLogAt >= ERROR_LOG_THROTTLE_MS) {
      lastConnectionErrorLogAt = now
      log.error(logPrefix, 'Connection error', getErrorMessage(error))
    }
  })
}

export const ensureMongoConnection = async (
  reason?: string,
  options?: EnsureMongoConnectionOptions
) => {
  setupListeners()

  if (isMongoReady()) {
    return
  }

  if (ensurePromise) {
    await ensurePromise
    return
  }

  ensurePromise = (async () => {
    const crashOnFailure = options?.crashOnFailure === true
    const maxAttempts = options?.maxAttempts || STARTUP_MAX_ATTEMPTS
    const retryDelayMs = options?.retryDelayMs || RETRY_DELAY_MS
    let attempts = 0

    if (reason) {
      log.info(logPrefix, 'Ensuring connection:', reason)
    }

    while (!isMongoReady()) {
      try {
        attempts++
        await connectMongo()
      } catch (error) {
        const now = Date.now()

        if (now - lastRetryLogAt >= RETRY_LOG_THROTTLE_MS) {
          lastRetryLogAt = now
          log.error(
            logPrefix,
            `Retrying in ${retryDelayMs}ms`,
            getErrorMessage(error)
          )
        }

        if (crashOnFailure && attempts >= maxAttempts) {
          const reasonPart = reason ? ` [${reason}]` : ''
          const crashMessage = `Mongo bootstrap failed${reasonPart}: ${getErrorMessage(
            error
          )}`

          log.error(logPrefix, crashMessage)
          await notifyMongoIssueToBoss(crashMessage)
          process.exit(1)
        }
      }

      if (!isMongoReady()) {
        await wait(retryDelayMs)
      }
    }
  })().finally(() => {
    ensurePromise = null
  })

  await ensurePromise
}

export const waitForMongoConnection = async (context?: string) => {
  if (!isMongoReady()) {
    const now = Date.now()

    if (now - lastWaitLogAt >= WAIT_LOG_THROTTLE_MS) {
      lastWaitLogAt = now
      log.info(
        logPrefix,
        'Waiting for connection',
        context ? `[${context}]` : '',
        `state=${getReadyState()}`
      )
    }

    await ensureMongoConnection(context)
  }
}

export const waitForMongoConnectionOrCrash = async (context?: string) => {
  if (!isMongoReady()) {
    log.info(
      logPrefix,
      'Waiting for connection (strict)',
      context ? `[${context}]` : '',
      `state=${getReadyState()}`
    )

    await ensureMongoConnection(context, {
      crashOnFailure: true,
      maxAttempts: STARTUP_MAX_ATTEMPTS,
      retryDelayMs: STARTUP_RETRY_DELAY_MS,
    })
  }
}

export const isMongoHealthy = async () => {
  if (!isMongoReady() || !mongoose.connection.db) {
    return false
  }

  try {
    await mongoose.connection.db.admin().ping()
    return true
  } catch (error) {
    log.error(logPrefix, 'Healthcheck failed', error)
    return false
  }
}
