const mongoose = require('mongoose');

// Connect to mongoose
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.set('useCreateIndex', true)

// Export models
export * from './CopyPriceAlerts'
export * from './InstrumentsList'
export * from './PriceAlert'
export * from './ShiftCandle'
export * from './Shifts'
export * from './ShiftTimeframe'
export * from './TimeShifts'
export * from './User'
