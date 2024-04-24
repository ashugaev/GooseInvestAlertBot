import { CandleResolution } from '@tinkoff/invest-openapi-js-sdk/build/domain'
import { CandleInterval } from 'tinkoff-invest-api/cjs/generated/marketdata'
import { Candle } from 'tinkoff-invest-api/src/generated/marketdata'

import { tinkoffApi } from '@/app'
import { ESfhitTimeframes, SHIFT_TIMEFRAMES } from '@/commands/shift'
import { getCandleCreatedTime, log } from '@/helpers'
import { wait } from '@/helpers/wait'
import { EMarketDataSources } from '@/marketApi/types'
import { getInstrumentsBySourceCache, InstrumentsList } from '@/models'
import { volumesAlertCache } from '@/models/VolumeAlert'
import { Volumes, volumesModelCache } from '@/models/Volumes'

const logPrefix = '[TINKOFF VOLUMES UPDATER]'

/**
 * tickerId: {
 *   timeframe: Volumes
 * }
 */
const candlesCache: Record<string, Record<string, Volumes>> = {}
const lastCreatedTimeById: Record<number, string> = {}

const TINK_CANDLES_LIFETIME: Record<
  Exclude<CandleResolution, 'month'>,
  number
> = {
  '1min': 60 * 1000,
  '2min': 2 * 60 * 1000,
  '3min': 3 * 60 * 1000,
  '5min': 5 * 60 * 1000,
  '10min': 10 * 60 * 1000,
  '15min': 15 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
}

const tinkCandleToMy = (candle: Candle): Volumes => ({
  timeframe: ESfhitTimeframes['1M'],
  amount: candle.volume,
  tickerId: candle.figi,
  candleCreatedTime: candle.time.getTime(),
})

/**
 * 1 Примет апдейт самой мальенькой свечи
 * 2 Если это апдейт, то пошлет адейт только этой свечи и она обновится в кэше
 * 3 Если это создание новой то пошлет увеличение объемов по всем свечам и создание этой свечи
 */
const generatedCandles = (data: Candle): Volumes[] => {
  const isNewTimeframe = lastCreatedTimeById[data.figi] !== data.time.getTime()

  lastCreatedTimeById[data.figi] = data.time.getTime()

  // Update input candle
  candlesCache[data.figi][data.interval] = tinkCandleToMy(data)

  if (isNewTimeframe) {
    // Use only timeframes bigger than input timeframe
    const timeframesToUpdate = Object.values(SHIFT_TIMEFRAMES).filter(
      (el) =>
        el.lifetime >= TINK_CANDLES_LIFETIME[data.interval] &&
        el.lifetime !== TINK_CANDLES_LIFETIME[data.interval] // Exclude current candle
    )

    timeframesToUpdate.forEach((timeframe) => {
      const prevValue = candlesCache[data.figi][timeframe.timeframe]

      const calculatedCandleCreateTime = getCandleCreatedTime(timeframe)
      // Check if new candle must be created
      const needIncrement = calculatedCandleCreateTime <= data.time.getTime()

      const volumesValue = needIncrement
        ? prevValue.amount + data.volume
        : data.volume

      const newCandle: Volumes = {
        timeframe: timeframe.timeframe as ESfhitTimeframes,
        amount: volumesValue,
        tickerId: data.figi,
        candleCreatedTime: calculatedCandleCreateTime,
      }

      candlesCache[data.figi][timeframe.timeframe] = newCandle
    })

    // Return all candles
    return Object.values(candlesCache[data.figi])
  } else {
    // Return only updated candle
    return [candlesCache[data.figi][data.interval]]
  }
}

const getPrioritizedVolumeInstruments = async (): Promise<{
  socketInstruments: InstrumentsList[]
  manualCheckInstruments: InstrumentsList[]
}> => {
  const allAlerts = volumesAlertCache.items.filter(
    (item) => item.source === EMarketDataSources.tinkoff
  )
  const allInstruments = await getInstrumentsBySourceCache(
    EMarketDataSources.tinkoff
  )

  const alertsCountByInstrumentId = allAlerts.reduce<Record<string, number>>(
    (acc, alert) => {
      if (!acc[alert.tickerId]) {
        acc[alert.tickerId] = 0
      }

      acc[alert.tickerId]++

      return acc
    },
    {}
  )

  const sortedByPopularity = allInstruments.sort((a, b) => {
    return alertsCountByInstrumentId[b.id] - alertsCountByInstrumentId[a.id]
  })

  const socketInstruments = sortedByPopularity.slice(0, 300)
  const manualCheckInstruments = sortedByPopularity.slice(300)

  return {
    socketInstruments,
    manualCheckInstruments,
  }
}

let prevWebsocketsInstrumentsStr = ''
let socketUnsubscribe: () => void

const startWebsocket = async (instruments) => {
  const instrumentsStr = instruments.map((el) => el.id).join('')

  // If input the same - return
  if (prevWebsocketsInstrumentsStr === instrumentsStr) {
    return
  } else {
    prevWebsocketsInstrumentsStr = instrumentsStr
  }

  try {
    // Last iteration unsubscribe
    socketUnsubscribe?.()

    const unsubscribe = await tinkoffApi.stream.market.candles(
      {
        instruments: instruments.map((el) => ({
          figi: el.id,
          interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
        })),
        waitingClose: false,
      },
      (data) => {
        const candles = generatedCandles(data)

        volumesModelCache.volumeSignal(candles)
      }
    )

    socketUnsubscribe = unsubscribe

    tinkoffApi.stream.market.on('error', (error) => {
      console.log('stream error', error)
      startWebsocket(instruments)
    })

    tinkoffApi.stream.market.on('close', (error) => {
      console.log('stream closed, reason:', error)
      startWebsocket(instruments)
    })
  } catch (e) {
    log.error(logPrefix, 'Error in websocket', e)
  }
}

export const tinkoffVolumesUpdater = async (): Promise<
  Record<string, number>
> => {
  // Большой цикл содержит больше вычисление и является оптимизацией
  while (true) {
    try {
      const { socketInstruments, manualCheckInstruments } =
        await getPrioritizedVolumeInstruments()

      // Бот запускается на холодную, поэтому нужно подождать пока все инструменты будут загружены
      if (!socketInstruments.length) {
        wait(1000)
        continue
      }

      startWebsocket(socketInstruments)

      const startTime = Date.now()
      const workTime = 1000 * 60 * 2
      const finishTime = startTime + workTime

      // Optimal interval in the case if bot will be broken for a few hours
      const timeframe = ESfhitTimeframes['5M']
      const candlesToRequest = 100 // TODO: Find biggest available value
      const candleTime = SHIFT_TIMEFRAMES[timeframe].lifetime
      const allCandlesTime = candlesToRequest * candleTime

      let i = 0
      let marketOpen = false

      let timer = new Date().getTime()

      // The small loop only makes the request itself without extra computations and fetching data from the database
      // New alerts will start working after 2 min
      // Limit tink: 300rpm
      while (Date.now() < finishTime) {
        try {
          const item = manualCheckInstruments[i]
          // Get all possible candles because quota per req
          const res = await tinkoffApi.marketdata.getCandles({
            figi: item.id,
            interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
            from: new Date(new Date().getTime() - allCandlesTime),
            to: new Date(),
          })

          if (res.candles.length) {
            marketOpen = true
          }

          res.candles.forEach((candle) => {
            const candles = generatedCandles(candle)

            volumesModelCache.volumeSignal(candles)
          })

          if (i >= manualCheckInstruments.length) {
            i = 0
            log.info(
              logPrefix,
              'All instruments update time',
              Date.now() - timer
            )

            timer = new Date().getTime()
          } else {
            i++
          }
        } catch (e) {
          log.error(logPrefix, 'Small cycle failing', e)
          await wait(500)
        }
      }

      if (!marketOpen) {
        await wait(1000 * 60 * 5)
      }
    } catch (e) {
      log.error(logPrefix, 'Big cycle failing', e)
      await wait(500)
    }
  }
}
