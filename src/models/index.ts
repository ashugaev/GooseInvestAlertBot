import { ensureMongoConnection } from '@/db/mongoose'

void ensureMongoConnection('models init', { crashOnFailure: true })

// Export models
export * from './CopyPriceAlerts'
export * from './InstrumentsList'
export * from './PriceAlert'
export * from './ShiftCandle'
export * from './Shifts'
export * from './TimeShifts'
export * from './User'
