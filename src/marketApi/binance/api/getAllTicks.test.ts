import * as console from 'console'

import {
  binanceAggTicksModel,
  saveTicks,
} from '@/bots/cryptoSignals/models/binanceAggTicks'
import { getAllTicks } from '@/marketApi/binance/api/getAllTicks'
const mongoose = require('mongoose')

describe('getAllTicks', () => {
  it('Manual: Fetch ticks by ticker and save to DB', async () => {
    // Connect to mongoose
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 100000,
      bufferTimeoutMS: 60000,
    })

    const ticks = await getAllTicks(new Date('2023-10-10'), 'DOGE')

    await saveTicks(ticks)
  })

  it('Get 1mln from db', async () => {
    // Connect to mongoose
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 100000,
      bufferTimeoutMS: 60000,
    })

    console.time('getTicks')
    // 1.5 min
    const res = await binanceAggTicksModel.find().limit(1000000).lean()
    console.timeEnd('getTicks')

    debugger
  })
})
