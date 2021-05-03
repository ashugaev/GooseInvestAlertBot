// Dependencies
import * as mongoose from 'mongoose'

// Connect to mongoose
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.set('useCreateIndex', true)

// Export models
export * from './User'
export * from './PriceAlert'
export * from './Aliases'
export * from './Shifts'
export * from './InstrumentsList'
