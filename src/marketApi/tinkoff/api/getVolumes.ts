import { CandleResolution } from '@tinkoff/invest-openapi-js-sdk/build/domain'
import {
  CandleInterval,
  SubscriptionInterval,
} from 'tinkoff-invest-api/cjs/generated/marketdata'
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

// Optimal interval in the case if bot will be broken for a few hours
// FIXME: Revert to 1min after debug
const TIMEFRAME = ESfhitTimeframes['1M']

// @ts-expect-error
const timeframeTySubscriptionTimeframe: Record<
  CandleInterval,
  SubscriptionInterval
> = {
  [CandleInterval.CANDLE_INTERVAL_1_MIN]:
    SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
  [CandleInterval.CANDLE_INTERVAL_5_MIN]:
    SubscriptionInterval.SUBSCRIPTION_INTERVAL_FIVE_MINUTES,
}

// @ts-expect-error
const myTimeframeToTink: Record<ESfhitTimeframes, CandleInterval> = {
  [ESfhitTimeframes['1M']]: CandleInterval.CANDLE_INTERVAL_1_MIN,
  [ESfhitTimeframes['5M']]: CandleInterval.CANDLE_INTERVAL_5_MIN,
  [ESfhitTimeframes['15M']]: CandleInterval.CANDLE_INTERVAL_15_MIN,
  [ESfhitTimeframes['1H']]: CandleInterval.CANDLE_INTERVAL_HOUR,
  [ESfhitTimeframes['1D']]: CandleInterval.CANDLE_INTERVAL_DAY,
}

const tinkCandleToMy = (candle: Candle): Volumes => ({
  timeframe: TIMEFRAME,
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
  try {
    const figi = data.figi

    if (!figi) {
      throw new Error('No figi in data')
    }

    const isNewTimeframe = lastCreatedTimeById[figi] !== data.time.getTime()

    lastCreatedTimeById[figi] = data.time.getTime()

    // Update input candle
    const normCandle = tinkCandleToMy(data)
    if (!candlesCache[figi]) {
      candlesCache[figi] = {}
    }
    candlesCache[figi][data.interval] = normCandle

    if (isNewTimeframe) {
      // Use only timeframes bigger than input timeframe
      const timeframesToUpdate = Object.values(SHIFT_TIMEFRAMES).filter(
        (el) =>
          el.lifetime >= TINK_CANDLES_LIFETIME[data.interval] &&
          el.lifetime !== TINK_CANDLES_LIFETIME[data.interval] // Exclude current candle
      )

      timeframesToUpdate.forEach((timeframe) => {
        const prevValue = candlesCache[figi][timeframe.timeframe]

        const calculatedCandleCreateTime = getCandleCreatedTime(timeframe)
        // Check if new candle must be created
        const needIncrement = calculatedCandleCreateTime <= data.time.getTime()

        const volumesValue = needIncrement
          ? prevValue.amount + data.volume
          : data.volume

        const newCandle: Volumes = {
          timeframe: timeframe.timeframe as ESfhitTimeframes,
          amount: volumesValue,
          tickerId: figi,
          candleCreatedTime: calculatedCandleCreateTime,
        }

        candlesCache[figi][timeframe.timeframe] = newCandle
      })

      // Return all candles
      return Object.values(candlesCache[figi])
    } else {
      // Return only updated candle
      return [candlesCache[figi][data.interval]]
    }
  } catch (e) {
    log.error(logPrefix, 'Error in generatedCandles', e)
    return []
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
  // FIXME: Test prioritization
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
          interval: myTimeframeToTink[TIMEFRAME],
        })),
        waitingClose: false,
      },
      (data) => {
        const candles = generatedCandles(data)

        // FIXME: Handle exceptions
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
      const workTime = 1000 * 60 * 2 // 2 min
      const finishTime = startTime + workTime

      // const candlesToRequest = 100 // TODO: Find biggest available value
      // FIXME: Revert to 100 (?) after debug
      //  может стоит оставить меньше потому что нагрузка на базу будет неадекватной
      const candlesToRequest = 20 // TODO: Find biggest available value
      const candleTime = SHIFT_TIMEFRAMES[TIMEFRAME].lifetime
      const allCandlesTime = candlesToRequest * candleTime

      let i = 0
      // const marketOpen = false

      let timer = new Date().getTime()

      // The small loop only makes the request itself without extra computations and fetching data from the database
      // New alerts will start working after 'workTime'
      // Limit tink: 300rpm
      while (Date.now() < finishTime) {
        try {
          const item = manualCheckInstruments[i]
          // Get all possible candles because quota per req
          const res = await tinkoffApi.marketdata.getCandles({
            figi: item.id,
            interval: myTimeframeToTink[TIMEFRAME],
            from: new Date(new Date().getTime() - allCandlesTime),
            to: new Date(),
          })

          // IF market is closed - skip and wait
          // TODO: Сделать так бот спал, если у всех не было новых свечей
          if (!res.candles.length) {
            // FIXME: Revert after debug
            // await wait(1000 * 60 * 5) // 5 min
            continue
          }

          // FIXME: Тут ошибка, я не должен генерить по каждой свече все остальные. Только по последней
          // res.candles.forEach((candle) => {
          //   // @ts-expect-error FIXME it's broken
          //   const candles = generatedCandles(candle)
          //
          //   volumesModelCache.volumeSignal(candles)
          // })

          const resNorm: Candle[] = res.candles.map((candle) => ({
            ...candle,
            figi: item.id,
            interval: timeframeTySubscriptionTimeframe[TIMEFRAME],
          }))

          for (const candle of resNorm) {
            const candles = generatedCandles(candle)
            await volumesModelCache.volumeSignal(candles)
          }

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
          if (Number(e.ratelimitRemaining) === 0) {
            await wait(1000 * 30)
          }
          log.error(logPrefix, 'Small cycle failing', e)
          await wait(500)
        }
      }
    } catch (e) {
      log.error(logPrefix, 'Big cycle failing', e)
      await wait(500)
    }
  }
}
